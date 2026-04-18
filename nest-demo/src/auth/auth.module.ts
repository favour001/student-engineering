import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LocalStrategy } from '../guards//local.strategy';
import { JwtStrategy } from '../guards/jwt.strategy';
import { SysUserModule } from '../sys-user/sys-user.module';
import { AuthController } from './auth.controller';
import { RefreshToken } from './entities/refresh-token.entity';
@Module({
  imports: [
    SysUserModule, 
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => (
        {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRE_TIME')
          }
        }
      ),
      inject: [ConfigService]
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
