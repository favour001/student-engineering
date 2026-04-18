import { Logger } from '@nestjs/common';
import { BaseSeeder } from './base.seeder';
import { SysDepartmentService } from '../../src/sys-department/sys-department.service';

export class DepartmentSeeder extends BaseSeeder {
  protected readonly logger = new Logger('DepartmentSeeder');
  protected readonly moduleName = '部门';
  protected readonly moduleIcon = '🏢';

  getService(app: any): SysDepartmentService {
    return app.get(SysDepartmentService);
  }

  async checkExists(service: SysDepartmentService, data: any): Promise<any> {
    const all = await service.findAllList();
    return all.find(d => d.code === data.code);
  }

  async createRecord(service: SysDepartmentService, data: any): Promise<void> {
    await service.create(data);
  }

  protected getDisplayName(data: any): string {
    return `${data.name}(${data.code})`;
  }
}
