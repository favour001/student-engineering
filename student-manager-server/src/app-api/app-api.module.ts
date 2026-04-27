import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppApiController } from './app-api.controller';
import { AppApiService } from './app-api.service';
import { AppRefreshToken } from './entities/app-refresh-token.entity';
import { AppMemberStyleController } from './member-style/app-member-style.controller';
import { AppMemberStyleService } from './member-style/app-member-style.service';
import { LxActivity } from '../student-business/entities/lx-activity.entity';
import { LxArticle } from '../student-business/entities/lx-article.entity';
import { LxCard } from '../student-business/entities/lx-card.entity';
import { LxMemberStyle } from '../student-business/entities/lx-member-style.entity';
import { LxRuhui } from '../student-business/entities/lx-ruhui.entity';
import { LxSign } from '../student-business/entities/lx-sign.entity';
import { LxTweet } from '../student-business/entities/lx-tweet.entity';
import { LxUserBanner } from '../student-business/entities/lx-user-banner.entity';
import { LxUserNotice } from '../student-business/entities/lx-user-notice.entity';
import { LxVideo } from '../student-business/entities/lx-video.entity';
import { LxVip } from '../student-business/entities/lx-vip.entity';
import { LxWelfare } from '../student-business/entities/lx-welfare.entity';
import { LxWxuser } from '../student-business/entities/lx-wxuser.entity';
import { LxXiehui } from '../student-business/entities/lx-xiehui.entity';
import { SysDepartment } from '../sys-department/entities/sys-department.entity';
import { SysPost } from '../sys-post/entities/sys-post.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      AppRefreshToken,
      LxActivity,
      LxArticle,
      LxCard,
      LxMemberStyle,
      LxRuhui,
      LxSign,
      LxTweet,
      LxUserBanner,
      LxUserNotice,
      LxVideo,
      LxVip,
      LxWelfare,
      LxWxuser,
      LxXiehui,
      SysDepartment,
      SysPost,
    ]),
  ],
  controllers: [AppApiController, AppMemberStyleController],
  providers: [AppApiService, AppMemberStyleService],
})
export class AppApiModule {}
