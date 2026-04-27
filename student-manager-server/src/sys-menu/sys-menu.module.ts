import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysMenuService } from './sys-menu.service';
import { SysMenuController } from './sys-menu.controller';
import { SysPermissionModule } from '../sys-permission/sys-permission.module';
import { SysMenu } from './entities/sys-menu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SysMenu]), // 添加这一行
    SysPermissionModule
  ],
  controllers: [SysMenuController],
  providers: [SysMenuService],
  exports: [SysMenuService], // 导出以便其他模块使用
})
export class SysMenuModule {}
