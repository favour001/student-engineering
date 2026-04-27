import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysDepartmentService } from './sys-department.service';
import { SysDepartmentController } from './sys-department.controller';
import { SysDepartment } from './entities/sys-department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SysDepartment])],
  controllers: [SysDepartmentController],
  providers: [SysDepartmentService],
  exports: [SysDepartmentService], // 导出以便其他模块使用
})
export class SysDepartmentModule {}