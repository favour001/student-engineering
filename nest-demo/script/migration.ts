import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Migration, MigrationOptions, MigrationRecord } from './interfaces/migration.interface';
import * as fs from 'fs';
import * as path from 'path';

class MigrationRunner {
  private readonly logger = new Logger('MigrationRunner');
  private app: any;
  private dataSource: DataSource;
  private options: MigrationOptions;

  constructor() {
    this.options = this.parseArguments(process.argv.slice(2));
  }

  private parseArguments(args: string[]): MigrationOptions {
    const options: MigrationOptions = {
      verbose: false,
      dryRun: false,
    };

    for (const arg of args) {
      if (arg === '--verbose' || arg === '-v') {
        options.verbose = true;
      } else if (arg === '--dry-run') {
        options.dryRun = true;
      }
    }

    return options;
  }

  async bootstrap() {
    try {
      this.logger.log('🔄 启动数据库迁移脚本...');

      this.app = await NestFactory.createApplicationContext(AppModule, {
        logger: this.options.verbose ? ['log', 'error', 'warn', 'debug'] : ['error', 'warn'],
      });

      this.dataSource = this.app.get(DataSource);

      if (this.options.dryRun) {
        this.logger.warn('🎭 预演模式：不会实际执行数据库操作');
      }

      const command = process.argv[2];
      
      switch (command) {
        case 'run':
          await this.runMigrations();
          break;
        case 'revert':
          await this.revertMigration();
          break;
        case 'show':
          await this.showMigrations();
          break;
        default:
          this.logger.error('❌ 未知命令。可用命令: run, revert, show');
          process.exit(1);
      }

      this.logger.log('✅ 数据库迁移脚本执行完成');
    } catch (error) {
      this.logger.error('❌ 数据库迁移脚本执行失败:', error.message);
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

  private async ensureMigrationsTable(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS \`migrations\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`timestamp\` bigint NOT NULL,
          \`name\` varchar(255) NOT NULL,
          \`executed_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } finally {
      await queryRunner.release();
    }
  }

  private async getExecutedMigrations(): Promise<MigrationRecord[]> {
    await this.ensureMigrationsTable();
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const results = await queryRunner.query(
        'SELECT * FROM migrations ORDER BY timestamp ASC'
      );
      return results;
    } finally {
      await queryRunner.release();
    }
  }

  private async loadMigrations(): Promise<Migration[]> {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .sort();

    const migrations: Migration[] = [];

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const migrationModule = require(filePath);
      const MigrationClass = Object.values(migrationModule)[0] as any;
      const migration = new MigrationClass();
      migrations.push(migration);
    }

    return migrations.sort((a, b) => a.timestamp - b.timestamp);
  }

  private async runMigrations(): Promise<void> {
    const allMigrations = await this.loadMigrations();
    const executedMigrations = await this.getExecutedMigrations();
    const executedTimestamps = new Set(executedMigrations.map(m => m.timestamp));

    const pendingMigrations = allMigrations.filter(
      m => !executedTimestamps.has(m.timestamp)
    );

    if (pendingMigrations.length === 0) {
      this.logger.log('📋 没有待执行的迁移');
      return;
    }

    this.logger.log(`📋 发现 ${pendingMigrations.length} 个待执行的迁移`);

    for (const migration of pendingMigrations) {
      await this.executeMigration(migration, 'up');
    }
  }

  private async executeMigration(migration: Migration, direction: 'up' | 'down'): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      this.logger.log(`🔄 执行迁移: ${migration.name} (${direction})`);

      if (this.options.dryRun) {
        this.logger.warn(`🎭 [预演] 将执行迁移: ${migration.name}`);
      } else {
        if (direction === 'up') {
          await migration.up(queryRunner);
          await queryRunner.query(
            'INSERT INTO migrations (timestamp, name) VALUES (?, ?)',
            [migration.timestamp, migration.name]
          );
        } else {
          await migration.down(queryRunner);
          await queryRunner.query(
            'DELETE FROM migrations WHERE timestamp = ?',
            [migration.timestamp]
          );
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`✅ 迁移完成: ${migration.name}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`❌ 迁移失败: ${migration.name}`, error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async revertMigration(): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();

    if (executedMigrations.length === 0) {
      this.logger.log('📋 没有可回滚的迁移');
      return;
    }

    const lastMigration = executedMigrations[executedMigrations.length - 1];
    const allMigrations = await this.loadMigrations();
    const migration = allMigrations.find(m => m.timestamp === lastMigration.timestamp);

    if (!migration) {
      this.logger.error(`❌ 找不到迁移文件: ${lastMigration.name}`);
      return;
    }

    this.logger.log(`🔄 回滚迁移: ${migration.name}`);
    await this.executeMigration(migration, 'down');
  }

  private async showMigrations(): Promise<void> {
    const allMigrations = await this.loadMigrations();
    const executedMigrations = await this.getExecutedMigrations();
    const executedTimestamps = new Set(executedMigrations.map(m => m.timestamp));

    this.logger.log('📋 迁移状态:');
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const migration of allMigrations) {
      const status = executedTimestamps.has(migration.timestamp) ? '✅ 已执行' : '⏳ 待执行';
      const executedAt = executedMigrations.find(m => m.timestamp === migration.timestamp)?.executed_at;
      const timeInfo = executedAt ? ` (${new Date(executedAt).toLocaleString()})` : '';
      
      this.logger.log(`${status} ${migration.name}${timeInfo}`);
    }

    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log(`总计: ${allMigrations.length} 个迁移`);
    this.logger.log(`已执行: ${executedMigrations.length} 个`);
    this.logger.log(`待执行: ${allMigrations.length - executedMigrations.length} 个`);
  }
}

async function main() {
  const migrationRunner = new MigrationRunner();
  
  try {
    await migrationRunner.bootstrap();
    process.exit(0);
  } catch (error) {
    console.error('❌ 脚本执行失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
