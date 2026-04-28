import { Module } from '@nestjs/common';
import { AppMemberStyleModule } from './member-style/app-member-style.module';
import { AppAuthModule } from './auth/app-auth.module';
import { AppUserModule } from './user/app-user.module';
import { AppContentModule } from './content/app-content.module';
import { AppActivityModule } from './activity/app-activity.module';
import { AppCardModule } from './card/app-card.module';
import { AppMerchantModule } from './merchant/app-merchant.module';
import { AppSystemModule } from './system/app-system.module';

@Module({
  imports: [
    AppMemberStyleModule,
    AppAuthModule, AppUserModule, AppContentModule, AppActivityModule, AppCardModule, AppMerchantModule, AppSystemModule
  ]
})
export class AppApiModule {}
