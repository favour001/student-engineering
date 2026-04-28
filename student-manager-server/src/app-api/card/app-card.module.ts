import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppCardController } from './app-card.controller';
import { AppCardService } from './app-card.service';
import { LxCard } from '../../student-business/entities/lx-card.entity';
import { LxVip } from '../../student-business/entities/lx-vip.entity';
import { LxWelfare } from '../../student-business/entities/lx-welfare.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      LxCard,
      LxVip,
      LxWelfare
    ]),
  ],
  controllers: [AppCardController],
  providers: [AppCardService],
})
export class AppCardModule {}
