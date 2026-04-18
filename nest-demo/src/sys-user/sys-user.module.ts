import { Module } from '@nestjs/common';
import { SysUserService } from './sys-user.service';
import { SysUserController } from './sys-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysUser } from './entities/sys-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SysUser])
  ],
  controllers: [SysUserController],
  providers: [SysUserService],
  exports: [SysUserService]
})
export class SysUserModule {}
