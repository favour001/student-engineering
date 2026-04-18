import { Logger } from '@nestjs/common';
import { SeedOptions } from '../interfaces/seed-options.interface';
import { StatsTracker } from '../utils/stats-tracker';

export abstract class BaseSeeder<T = any> {
  protected abstract readonly logger: Logger;
  protected abstract readonly moduleName: string;
  protected abstract readonly moduleIcon: string;

  constructor(
    protected readonly options: SeedOptions,
    protected readonly stats: StatsTracker
  ) {}

  abstract getService(app: any): any;
  abstract checkExists(service: any, data: T): Promise<any>;
  abstract createRecord(service: any, data: T): Promise<void>;

  async seed(app: any, data: T[]): Promise<void> {
    if (!data || data.length === 0) {
      this.logger.log(`⚠️  没有${this.moduleName}数据需要处理`);
      return;
    }

    this.logger.log(`${this.moduleIcon} 开始处理${this.moduleName}数据 (${data.length} 条)...`);
    this.stats.addTotal(data.length);

    const service = this.getService(app);
    const batchSize = this.options.batch || 20;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await this.processBatch(service, batch);
      
      const processed = Math.min(i + batchSize, data.length);
      this.logger.log(`📊 ${this.moduleName}进度: ${processed}/${data.length}`);
    }
  }

  private async processBatch(service: any, batch: T[]) {
    // 改为顺序处理，确保数据按顺序插入
    for (const item of batch) {
      try {
        await this.processItem(service, item);
        this.stats.incrementCreated();
      } catch (error) {
        this.stats.incrementFailed();
        this.logger.error(`❌ ${this.moduleName}处理失败:`, error.message);
        if (this.options.verbose) {
          console.error(error.stack);
        }
      }
    }
  }

  private async processItem(service: any, data: T) {
    const displayName = this.getDisplayName(data);

    if (this.options.dryRun) {
      this.logger.debug(`🎭 [预演] 将创建${this.moduleName}: ${displayName}`);
      return;
    }

    const existing = await this.checkExists(service, data);
    
    if (existing) {
      if (this.options.force) {
        this.logger.log(`🔄 ${this.moduleName} ${displayName} 已存在，强制模式下跳过更新`);
        this.stats.incrementUpdated();
      } else {
        this.logger.debug(`⚠️  ${this.moduleName} ${displayName} 已存在，跳过`);
        this.stats.incrementSkipped();
        return;
      }
    } else {
      await this.createRecord(service, data);
      this.logger.debug(`✅ ${this.moduleName} ${displayName} 创建成功`);
    }
  }

  protected abstract getDisplayName(data: T): string;

  async clean(app: any): Promise<void> {
    this.logger.log(`🗑️  清理${this.moduleName}数据...`);
    this.logger.log(`⚠️  ${this.moduleName}清理功能需要根据实际需求实现`);
  }
}