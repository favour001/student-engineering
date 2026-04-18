import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityBusinessController } from './controllers/activity-business.controller';
import { BenefitBusinessController } from './controllers/benefit-business.controller';
import { ContentBusinessController } from './controllers/content-business.controller';
import { MemberBusinessController } from './controllers/member-business.controller';
import { LxActivity } from './entities/lx-activity.entity';
import { LxArticle } from './entities/lx-article.entity';
import { LxCard } from './entities/lx-card.entity';
import { LxInformation } from './entities/lx-information.entity';
import { LxMerchant } from './entities/lx-merchant.entity';
import { LxMerchantUser } from './entities/lx-merchant-user.entity';
import { LxRuhui } from './entities/lx-ruhui.entity';
import { LxSign } from './entities/lx-sign.entity';
import { LxTweet } from './entities/lx-tweet.entity';
import { LxUserBanner } from './entities/lx-user-banner.entity';
import { LxUserJin } from './entities/lx-user-jin.entity';
import { LxUserManager } from './entities/lx-user-manager.entity';
import { LxUserNotice } from './entities/lx-user-notice.entity';
import { LxVideo } from './entities/lx-video.entity';
import { LxVip } from './entities/lx-vip.entity';
import { LxWelfare } from './entities/lx-welfare.entity';
import { LxWxuser } from './entities/lx-wxuser.entity';
import { LxXiehui } from './entities/lx-xiehui.entity';
import { ActivityBusinessService } from './services/activity-business.service';
import { BenefitBusinessService } from './services/benefit-business.service';
import { ContentBusinessService } from './services/content-business.service';
import { MemberBusinessService } from './services/member-business.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LxActivity,
      LxSign,
      LxUserManager,
      LxXiehui,
      LxRuhui,
      LxUserNotice,
      LxArticle,
      LxTweet,
      LxInformation,
      LxMerchant,
      LxMerchantUser,
      LxVideo,
      LxUserBanner,
      LxUserJin,
      LxWxuser,
      LxVip,
      LxWelfare,
      LxCard,
    ]),
  ],
  controllers: [
    ActivityBusinessController,
    MemberBusinessController,
    ContentBusinessController,
    BenefitBusinessController,
  ],
  providers: [
    ActivityBusinessService,
    MemberBusinessService,
    ContentBusinessService,
    BenefitBusinessService,
  ],
})
export class StudentBusinessModule {}
