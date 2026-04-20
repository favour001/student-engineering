import * as fs from 'fs';
import { Logger } from '@nestjs/common';
import { SeedConfig } from '../interfaces/seed-config.interface';

export class ConfigLoader {
  private readonly logger = new Logger('ConfigLoader');

  load(configFile: string): SeedConfig {
    try {
      if (!fs.existsSync(configFile)) {
        throw new Error(`配置文件不存在: ${configFile}`);
      }

      this.logger.log(`📂 加载配置文件: ${configFile}`);
      const rawData = fs.readFileSync(configFile, 'utf8');
      const config = JSON.parse(rawData);

      return config;
    } catch (error) {
      throw new Error(`配置文件加载失败: ${error.message}`);
    }
  }

  validate(config: SeedConfig, modules: string[]) {
    for (const module of modules) {
      if (config[module] && !Array.isArray(config[module])) {
        throw new Error(`${module} 必须是数组格式`);
      }
    }
  }
}
