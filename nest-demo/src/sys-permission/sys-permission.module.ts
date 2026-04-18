import { Module } from '@nestjs/common';
import { SysPermissionService } from './sys-permission.service';
import { SysPermissionController } from './sys-permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysUser } from '../sys-user/entities/sys-user.entity';
import { SysRole } from '../sys-role/entities/sys-role.entity';
import { SysMenu } from '../sys-menu/entities/sys-menu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SysUser, SysRole, SysMenu])
  ],
  controllers: [SysPermissionController],
  providers: [SysPermissionService],
  exports: [SysPermissionService]
})
export class SysPermissionModule {}
