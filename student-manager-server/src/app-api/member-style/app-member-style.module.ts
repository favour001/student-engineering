import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppMemberStyleController } from './app-member-style.controller';
import { AppMemberStyleService } from './app-member-style.service';
import { LxMemberStyle } from '../../student-business/entities/lx-member-style.entity';
import { SysDepartment } from '../../sys-department/entities/sys-department.entity';
import { SysPost } from '../../sys-post/entities/sys-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LxMemberStyle, SysDepartment, SysPost]),
  ],
  controllers: [AppMemberStyleController],
  providers: [AppMemberStyleService],
})
export class AppMemberStyleModule {}
