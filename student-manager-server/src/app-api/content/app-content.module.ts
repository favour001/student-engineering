import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppContentController } from './app-content.controller';
import { AppContentService } from './app-content.service';
import { LxUserBanner } from '../../student-business/entities/lx-user-banner.entity';
import { LxArticle } from '../../student-business/entities/lx-article.entity';
import { LxUserNotice } from '../../student-business/entities/lx-user-notice.entity';
import { LxTweet } from '../../student-business/entities/lx-tweet.entity';
import { LxVideo } from '../../student-business/entities/lx-video.entity';
import { LxUserJin } from '../../student-business/entities/lx-user-jin.entity';
import { LxXiehui } from '../../student-business/entities/lx-xiehui.entity';
import { LxRuhui } from '../../student-business/entities/lx-ruhui.entity';
import { BusinessContentCategory } from '../../student-business/entities/business-content-category.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      LxUserBanner,
      LxArticle,
      LxUserNotice,
      LxTweet,
      LxVideo,
      LxUserJin,
      LxXiehui,
      LxRuhui,
      BusinessContentCategory
    ]),
  ],
  controllers: [AppContentController],
  providers: [AppContentService],
})
export class AppContentModule {}
