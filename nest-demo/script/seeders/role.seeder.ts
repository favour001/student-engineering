import { Logger } from '@nestjs/common';
import { BaseSeeder } from './base.seeder';
import { SysRoleService } from '../../src/sys-role/sys-role.service';

export class RoleSeeder extends BaseSeeder {
  protected readonly logger = new Logger('RoleSeeder');
  protected readonly moduleName = '角色';
  protected readonly moduleIcon = '👔';

  getService(app: any): SysRoleService {
    return app.get(SysRoleService);
  }

  async checkExists(service: SysRoleService, data: any): Promise<any> {
    const all = await service.findAllList();
    return all.find(r => r.code === data.code);
  }

  async createRecord(service: SysRoleService, data: any): Promise<void> {
    await service.create(data);
  }

  protected getDisplayName(data: any): string {
    return `${data.name}(${data.code})`;
  }
}