import * as readline from 'readline';
import { SeedOptions } from '../interfaces/seed-options.interface';
import * as path from 'path';

export class CliHelper {
  static parseArguments(args: string[]): SeedOptions {
    const options: SeedOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--force':
        case '-f':
          options.force = true;
          break;
        case '--clean':
        case '-c':
          options.clean = true;
          break;
        case '--dry-run':
        case '-d':
          options.dryRun = true;
          break;
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
        case '--config':
          options.configFile = args[++i];
          break;
        case '--batch':
          options.batch = parseInt(args[++i]) || 20;
          break;
        case '--module':
        case '-m':
          options.module = args[++i];
          break;
        case '--help':
        case '-h':
          CliHelper.showHelp();
          process.exit(0);
        default:
          if (!arg.startsWith('--') && !options.configFile) {
            if (['users', 'roles', 'menus', 'departments', 'posts', 'all'].includes(arg)) {
              options.module = arg;
            } else {
              options.configFile = arg;
            }
          }
      }
    }

    // 设置默认值
    options.module = options.module || 'all';
    if (!options.configFile) {
      options.configFile = path.join(__dirname, '..', '..', 'config', 'seeds', 'development.json');
    }

    return options;
  }

  static showHelp() {
    console.log(`
🌱 数据库种子脚本

用法: npm run seed [模块] [配置文件] [选项]

模块:
  users             用户数据
  departments       部门数据
  posts             岗位数据
  menus             菜单数据
  roles             角色数据
  all               所有模块 (默认)

选项:
  -f, --force       强制执行，覆盖已存在数据
  -c, --clean       执行前清理数据
  -d, --dry-run     预演模式，不实际执行
  -v, --verbose     显示详细日志
  --config <file>   指定配置文件路径
  --batch <size>    批处理大小 (默认: 20)
  -m, --module <m>  指定模块
  -h, --help        显示帮助信息

示例:
  npm run seed                                    # 执行所有模块
  npm run seed users                              # 只执行用户数据
  npm run seed departments                        # 只执行部门数据
  npm run seed all --force --verbose             # 执行所有模块，强制模式
  npm run seed --config ./my-config.json         # 使用自定义配置文件
  npm run seed --module menus --dry-run          # 预演菜单数据
    `);
  }

  static async confirmClean(): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question('⚠️  确认清理数据？输入 "CLEAN" 确认: ', (answer) => {
        rl.close();
        resolve(answer === 'CLEAN');
      });
    });
  }
}