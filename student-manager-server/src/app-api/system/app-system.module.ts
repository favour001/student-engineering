import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSystemController } from './app-system.controller';
import { AppSystemService } from './app-system.service';
import { SysPost } from '../../sys-post/entities/sys-post.entity';
import { SysDepartment } from '../../sys-department/entities/sys-department.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      SysPost,
      SysDepartment
    ]),
  ],
  controllers: [AppSystemController],
  providers: [AppSystemService],
})
export class AppSystemModule {}
