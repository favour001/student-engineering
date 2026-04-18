import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { SeedOptions } from './interfaces/seed-options.interface';
import { SeedConfig } from './interfaces/seed-config.interface';
import { ConfigLoader } from './utils/config-loader';
import { StatsTracker } from './utils/stats-tracker';
import { CliHelper } from './utils/cli-helper';
import {
  UserSeeder,
  DepartmentSeeder,
  PostSeeder,
  MenuSeeder,
  RoleSeeder,
  RelationSeeder
} from './seeders';

class SeedRunner {
  private readonly logger = new Logger('SeedRunner');
  private app: any;
  private options: SeedOptions;
  private stats: StatsTracker;
  private configLoader: ConfigLoader;

  // Seeders 映射
  private seeders: Map<string, any>;

  constructor() {
    this.options = CliHelper.parseArguments(process.argv.slice(2));
    this.stats = new StatsTracker();
    this.configLoader = new ConfigLoader();
    this.seeders = new Map();
  }

  async bootstrap() {
    try {
      this.logger.log('🌱 启动数据库种子脚本...');
      
      // 创建应用上下文
      this.app = await NestFactory.createApplicationContext(AppModule, {
        logger: this.options.verbose ? ['log', 'error', 'warn', 'debug'] : ['error', 'warn'],
      });

      // 初始化 seeders
      this.initializeSeeders();

      // 预演模式提示
      if (this.options.dryRun) {
        this.logger.warn('🎭 预演模式：不会实际执行数据库操作');
      }

      // 执行清理（如果需要）
      if (this.options.clean) {
        await this.cleanData();
      }

      // 执行种子数据
      await this.executeSeeds();

      // 显示统计信息
      this.stats.display();
      
      this.logger.log('✅ 数据库种子脚本执行完成');
      
    } catch (error) {
      this.logger.error('❌ 数据库种子脚本执行失败:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      throw error;
    } finally {
      if (this.app) {
        await this.app.close();
      }
    }
  }

  private initializeSeeders() {
    this.seeders.set('departments', new DepartmentSeeder(this.options, this.stats));
    this.seeders.set('posts', new PostSeeder(this.options, this.stats));
    this.seeders.set('menus', new MenuSeeder(this.options, this.stats));
    this.seeders.set('roles', new RoleSeeder(this.options, this.stats));
    this.seeders.set('users', new UserSeeder(this.options, this.stats));
  }

  private shouldRunModule(moduleName: string): boolean {
    return this.options.module === 'all' || this.options.module === moduleName;
  }

  private async executeSeeds() {
    // 加载配置
    const config: SeedConfig = this.configLoader.load(this.options.configFile);
    
    // 验证配置
    const modulesToValidate = Array.from(this.seeders.keys()).filter(m => this.shouldRunModule(m));
    this.configLoader.validate(config, modulesToValidate);

    // 第一阶段：按依赖顺序执行基础数据种子（无关联关系）
    this.logger.log('📦 第一阶段：插入基础数据...');
    const executionOrder = ['departments', 'posts', 'menus', 'roles', 'users'];
    
    for (const moduleName of executionOrder) {
      if (this.shouldRunModule(moduleName) && this.seeders.has(moduleName)) {
        const seeder = this.seeders.get(moduleName);
        const data = config[moduleName];
        
        if (data && data.length > 0) {
          await seeder.seed(this.app, data);
        }
      }
    }

    // 第二阶段：处理关联关系（用户-角色、角色-菜单等）
    if (config.relations) {
      this.logger.log('🔗 第二阶段：处理关联关系...');
      const relationSeeder = new RelationSeeder(this.options, this.stats);
      await relationSeeder.seed(this.app, config.relations);
    }
  }

  private async cleanData() {
    if (this.options.dryRun) {
      this.logger.warn('🎭 [预演] 将清理数据');
      return;
    }

    const confirmed = await CliHelper.confirmClean();
    if (!confirmed) {
      this.logger.warn('❌ 取消清理操作');
      return;
    }

    this.logger.log('🧹 开始清理数据...');
    
    for (const [moduleName, seeder] of this.seeders) {
      if (this.shouldRunModule(moduleName)) {
        await seeder.clean(this.app);
      }
    }
  }
}

// 主函数
async function main() {
  const seedRunner = new SeedRunner();
  
  try {
    await seedRunner.bootstrap();
    process.exit(0);
  } catch (error) {
    console.error('❌ 脚本执行失败:', error.message);
    process.exit(1);
  }
}

// 执行脚本
if (require.main === module) {
  main();
}