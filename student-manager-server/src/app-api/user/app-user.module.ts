import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUserController } from './app-user.controller';
import { AppUserService } from './app-user.service';
import { LxWxuser } from '../../student-business/entities/lx-wxuser.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      LxWxuser
    ]),
  ],
  controllers: [AppUserController],
  providers: [AppUserService],
})
export class AppUserModule {}
