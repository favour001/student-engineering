import { Logger } from '@nestjs/common';
import { BaseSeeder } from './base.seeder';
import { SysMenuService } from '../../src/sys-menu/sys-menu.service';

export class MenuSeeder extends BaseSeeder {
  protected readonly logger = new Logger('MenuSeeder');
  protected readonly moduleName = '菜单';
  protected readonly moduleIcon = '';

  getService(app: any): SysMenuService {
    return app.get(SysMenuService);
  }

  async checkExists(service: SysMenuService, data: any): Promise<any> {
    const all = await service.findAllList();
    return all.find(m => m.code === data.code);
  }

  async createRecord(service: SysMenuService, data: any): Promise<void> {
    await service.create(data);
  }

  protected getDisplayName(data: any): string {
    return `${data.name}(${data.code})`;
  }

  async seed(app: any, data: any[]): Promise<void> {
    if (!data || data.length === 0) {
      this.logger.log(`  没有${this.moduleName}数据需要处理`);
      return;
    }

    this.logger.log(` 开始处理${this.moduleName}数据 (${data.length} 条)...`);
    this.stats.addTotal(data.length);

    const service = this.getService(app);

    const idMap = new Map<number, number>();

    const sortedData = this.sortMenusByHierarchy(data);

    for (const item of sortedData) {
      try {
        const displayName = this.getDisplayName(item);

        if (this.options.dryRun) {
          this.logger.debug(`[预演] 将创建${this.moduleName}: ${displayName}`);
          this.stats.incrementCreated();
          continue;
        }

        const existing = await this.checkExists(service, item);

        if (existing) {
          this.logger.debug(` ${this.moduleName} ${displayName} 已存在，跳过`);
          this.stats.incrementSkipped();
          const seedIndex = data.indexOf(item);
          if (seedIndex >= 0) {
            idMap.set(seedIndex + 1, existing.id);
          }
        } else {
          let actualParentId = item.parentId;
          if (item.parentId && idMap.has(item.parentId)) {
            actualParentId = idMap.get(item.parentId);
          }

          const menuToCreate = { ...item, parentId: actualParentId };
          const created = await service.create(menuToCreate);

          const seedIndex = data.indexOf(item);
          if (seedIndex >= 0) {
            idMap.set(seedIndex + 1, created.id);
          }

          this.logger.debug(` ${this.moduleName} ${displayName} 创建成功 (ID: ${created.id})`);
          this.stats.incrementCreated();
        }
      } catch (error) {
        this.stats.incrementFailed();
        this.logger.error(` ${this.moduleName}处理失败:`, error.message);
        if (this.options.verbose) {
          console.error(error.stack);
        }
      }
    }
  }

  private sortMenusByHierarchy(data: any[]): any[] {
    const sorted: any[] = [];
    const remaining = [...data];

    const topLevel = remaining.filter(item => item.parentId === null || item.parentId === undefined);
    sorted.push(...topLevel);
    topLevel.forEach(item => {
      const index = remaining.indexOf(item);
      if (index > -1) remaining.splice(index, 1);
    });

    while (remaining.length > 0) {
      const previousLength = remaining.length;
      const currentBatch: any[] = [];

      for (let i = remaining.length - 1; i >= 0; i--) {
        const item = remaining[i];
        const seedIndex = data.indexOf(item);

        const parentInSorted = sorted.some((parent, idx) => {
          const parentSeedIndex = data.indexOf(parent);
          return (parentSeedIndex + 1) === item.parentId;
        });

        if (parentInSorted || !item.parentId) {
          currentBatch.push(item);
          remaining.splice(i, 1);
        }
      }

      sorted.push(...currentBatch);

      if (remaining.length === previousLength) {
        this.logger.warn(` 检测到循环依赖或无效的 parentId，剩余 ${remaining.length} 条数据将按原顺序处理`);
        sorted.push(...remaining);
        break;
      }
    }

    return sorted;
  }
}