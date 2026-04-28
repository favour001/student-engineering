import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppMerchantController } from './app-merchant.controller';
import { AppMerchantService } from './app-merchant.service';
import { LxMerchant } from '../../student-business/entities/lx-merchant.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      LxMerchant
    ]),
  ],
  controllers: [AppMerchantController],
  providers: [AppMerchantService],
})
export class AppMerchantModule {}
