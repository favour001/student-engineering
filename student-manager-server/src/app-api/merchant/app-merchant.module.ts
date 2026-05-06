import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppMerchantController } from './app-merchant.controller';
import { AppMerchantService } from './app-merchant.service';
import { LxMerchant } from '../../student-business/entities/lx-merchant.entity';
import { BusinessContentCategory } from '../../student-business/entities/business-content-category.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      LxMerchant,
      BusinessContentCategory
    ]),
  ],
  controllers: [AppMerchantController],
  providers: [AppMerchantService],
})
export class AppMerchantModule {}
