import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppMemberStyleController } from './app-member-style.controller';
import { AppMemberStyleService } from './app-member-style.service';
import { LxMemberStyle } from '../../student-business/entities/lx-member-style.entity';
import { LxMemberAward } from '../../student-business/entities/lx-member-award.entity';
import { LxMemberStyleAward } from '../../student-business/entities/lx-member-style-award.entity';
import { LxMemberStyleDepartment } from '../../student-business/entities/lx-member-style-department.entity';
import { LxMemberStylePost } from '../../student-business/entities/lx-member-style-post.entity';
import { SysDepartment } from '../../sys-department/entities/sys-department.entity';
import { SysPost } from '../../sys-post/entities/sys-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LxMemberStyle,
      LxMemberAward,
      LxMemberStyleAward,
      LxMemberStyleDepartment,
      LxMemberStylePost,
      SysDepartment,
      SysPost,
    ]),
  ],
  controllers: [AppMemberStyleController],
  providers: [AppMemberStyleService],
})
export class AppMemberStyleModule {}
