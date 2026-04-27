import { Logger } from '@nestjs/common';
import { BaseSeeder } from './base.seeder';
import { SysPostService } from '../../src/sys-post/sys-post.service';

export class PostSeeder extends BaseSeeder {
  protected readonly logger = new Logger('PostSeeder');
  protected readonly moduleName = '岗位';
  protected readonly moduleIcon = '💼';

  getService(app: any): SysPostService {
    return app.get(SysPostService);
  }

  async checkExists(service: SysPostService, data: any): Promise<any> {
    const all = await service.findAllList();
    return all.find(p => p.code === data.code);
  }

  async createRecord(service: SysPostService, data: any): Promise<void> {
    await service.create(data);
  }

  protected getDisplayName(data: any): string {
    return `${data.name}(${data.code})`;
  }
}