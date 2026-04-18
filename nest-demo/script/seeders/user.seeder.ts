import { Logger } from '@nestjs/common';
import { BaseSeeder } from './base.seeder';
import { SysUserService } from '../../src/sys-user/sys-user.service';

export class UserSeeder extends BaseSeeder {
  protected readonly logger = new Logger('UserSeeder');
  protected readonly moduleName = '用户';
  protected readonly moduleIcon = '👥';

  getService(app: any): SysUserService {
    return app.get(SysUserService);
  }

  async checkExists(service: SysUserService, data: any): Promise<any> {
    return await service.findOneByAccount(data.account);
  }

  async createRecord(service: SysUserService, data: any): Promise<void> {
    await service.create(data);
  }

  protected getDisplayName(data: any): string {
    return `${data.userName}(${data.account})`;
  }
}