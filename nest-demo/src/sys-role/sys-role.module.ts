import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysRoleService } from './sys-role.service';
import { SysRoleController } from './sys-role.controller';
import { SysPermissionModule } from '../sys-permission/sys-permission.module';
import { SysRole } from './entities/sys-role.entity';
import { SysUser } from '../sys-user/entities/sys-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SysRole, SysUser]),
    SysPermissionModule
  ],
  controllers: [SysRoleController],
  providers: [SysRoleService],
  exports: [SysRoleService],
})
export class SysRoleModule {}