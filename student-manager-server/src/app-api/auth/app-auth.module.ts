import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppAuthController } from './app-auth.controller';
import { AppAuthService } from './app-auth.service';
import { AppRefreshToken } from '../entities/app-refresh-token.entity';
import { LxWxuser } from '../../student-business/entities/lx-wxuser.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      AppRefreshToken,
      LxWxuser
    ]),
  ],
  controllers: [AppAuthController],
  providers: [AppAuthService],
})
export class AppAuthModule {}
