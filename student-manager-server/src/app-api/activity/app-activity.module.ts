import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppActivityController } from './app-activity.controller';
import { AppActivityService } from './app-activity.service';
import { LxActivity } from '../../student-business/entities/lx-activity.entity';
import { LxSign } from '../../student-business/entities/lx-sign.entity';
import { LxWxuser } from '../../student-business/entities/lx-wxuser.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      LxActivity,
      LxSign,
      LxWxuser
    ]),
  ],
  controllers: [AppActivityController],
  providers: [AppActivityService],
})
export class AppActivityModule {}
