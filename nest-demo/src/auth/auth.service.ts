import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { SysUserService } from '../sys-user/sys-user.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { parseDeviceInfo } from '../common/http/device-info';

@Injectable()
export class AuthService {
  constructor(
    private sysUserService: SysUserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) { }

  async validateUser(account: string, password: string): Promise<any> {
    const user = await this.sysUserService.findOneByAccount(account);
    if (!user || user.status !== 0) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const { id, userName, account } = user;
      return { id, userName, account };
    }
    return null;
  }

  async login(req: any) {
    const user = req.user;
    console.log('user:', user);
    const deviceInfo = parseDeviceInfo(req.headers['user-agent'] || 'unknown');
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // 获取完整的用户信息（包括角色、部门、岗位等）
    const userInfo = await this.sysUserService.findOne(user.id);
    
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, deviceInfo, ipAddress);
    
    return {
      id: user.id,
      userName: userInfo.userName,
      account: userInfo.account,
      email: userInfo.email,
      phoneNumber: userInfo.phoneNumber,
      profileImage: userInfo.profileImage,
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  async generateAccessToken(user: any): Promise<string> {
    const payload = { account: user.account, sub: user.id };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRE_TIME') as StringValue
    });
  }

  async generateRefreshToken(user: any, deviceInfo: string, ipAddress: string): Promise<string> {
    const payload = { sub: user.id, type: 'refresh', jti: randomUUID() };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE_TIME') as StringValue
    });
    const expiresTime = new Date();
    expiresTime.setDate(expiresTime.getDate() + 7);
    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId: user.id,
      expiresTime,
      deviceInfo,
      ipAddress,
      isRevoked: false
    });
    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      });
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }
      const tokenRecord = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken, isRevoked: false },
        relations: ['user']
      });
      if (!tokenRecord) {
        throw new UnauthorizedException('Refresh token not found or revoked');
      }
      if (new Date() > tokenRecord.expiresTime) {
        throw new UnauthorizedException('Refresh token expired');
      }
      const user = tokenRecord.user;
      const newAccessToken = await this.generateAccessToken(user);
      await this.refreshTokenRepository.update(
        { token: refreshToken },
        { isRevoked: true, revokedTime: new Date(), revokeReason: 'Token rotated' }
      );
      const newRefreshToken = await this.generateRefreshToken(
        user,
        tokenRecord.deviceInfo,
        tokenRecord.ipAddress
      );
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: number, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.refreshTokenRepository.update(
        { token: refreshToken, userId },
        { isRevoked: true, revokedTime: new Date(), revokeReason: 'User logout' }
      );
    } else {
      await this.refreshTokenRepository.update(
        { userId, isRevoked: false },
        { isRevoked: true, revokedTime: new Date(), revokeReason: 'User logout all devices' }
      );
    }
  }
  async revokeAllUserTokens(userId: number, reason: string = 'Password changed'): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true, revokedTime: new Date(), revokeReason: reason }
    );
  }
  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresTime: LessThan(new Date())
    });
  }

  async register(user: { userName: string, password: string }) {

    const saltOrRounds = 10;
    const salt = await bcrypt.genSalt(saltOrRounds);
    const hash = await bcrypt.hash(user.password, salt);

    const isMatch = await bcrypt.compare(user.password, '$2a$10$Brk1l0fvAmNf1Et02Bons..x4hRIHmxCB95dGORp5jPZ2PisP/Lz2');
    console.log(isMatch)
    return hash
  }
}
