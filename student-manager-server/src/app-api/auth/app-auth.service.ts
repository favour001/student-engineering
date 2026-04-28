import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { AppRefreshToken } from '../entities/app-refresh-token.entity';
import { LxWxuser } from '../../student-business/entities/lx-wxuser.entity';

type PageQuery = Record<string, string | number | undefined>;

@Injectable()
export class AppAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(AppRefreshToken) private readonly appRefreshTokenRepo: Repository<AppRefreshToken>,
    @InjectRepository(LxWxuser) private readonly wxuserRepo: Repository<LxWxuser>
  ) {}

  async login(payload: Record<string, string>, req: any) {
    const loginCode = payload.loginCode || payload.code;
    const phoneCode = payload.phoneCode;
    if (!loginCode) {
      throw new BadRequestException('缺少微信登录凭证');
    }

    const session = await this.fetchWechatSession(loginCode);
    const phoneNumber = phoneCode ? await this.fetchWechatPhone(phoneCode) : payload.mobile;
    if (!phoneNumber) {
      throw new BadRequestException('缺少手机号授权，无法登录');
    }

    const user = await this.wxuserRepo.findOne({ where: { mobile: phoneNumber } });
    if (!user) {
      throw new UnauthorizedException('手机号未在后台录入，请联系管理员录入后再登录');
    }

    if (session.openid && user.wxopenid !== session.openid) {
      user.wxopenid = session.openid;
      await this.wxuserRepo.save(user);
    }

    const token = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, session.openid, req);
    return {
      id: user.id,
      token,
      accessToken: token,
      refreshToken,
      refresh_token: refreshToken,
      expiresIn: 3600,
      user: this.mapWxUser(user),
    };
  }

  async refresh(refreshToken: string, req: any) {
    if (!refreshToken) {
      throw new BadRequestException('缺少 refreshToken');
    }
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }

    if (payload.type !== 'app-refresh') {
      throw new UnauthorizedException('无效的 refreshToken');
    }

    const record = await this.appRefreshTokenRepo.findOne({
      where: { token: refreshToken, isRevoked: false },
    });
    if (!record || new Date() > record.expiresTime) {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }

    const user = await this.wxuserRepo.findOne({ where: { id: record.userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    await this.appRefreshTokenRepo.update(
      { id: record.id },
      { isRevoked: true, revokedTime: new Date() },
    );
    const token = this.generateAccessToken(user);
    const nextRefreshToken = await this.generateRefreshToken(user, record.openid || user.wxopenid || null, req);
    return {
      id: user.id,
      token,
      accessToken: token,
      refreshToken: nextRefreshToken,
      refresh_token: nextRefreshToken,
      expiresIn: 3600,
      user: this.mapWxUser(user),
    };
  }

  async me(authorization?: string, tokenHeader?: string) {
    const token = this.extractToken(authorization, tokenHeader);
    if (!token) {
      throw new UnauthorizedException('请先登录');
    }
    const payload = this.verifyAccessToken(token);
    const user = await this.wxuserRepo.findOne({ where: { id: Number(payload.sub) } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return this.mapWxUser(user);
  }

  private async fetchWechatSession(code: string): Promise<{ openid?: string; session_key?: string }> {
    const appid = this.configService.get<string>('WECHAT_APPID');
    const secret = this.configService.get<string>('WECHAT_SECRET');
    if (!appid || !secret) {
      return { openid: `dev-${code}` };
    }
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(appid)}&secret=${encodeURIComponent(secret)}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.errcode) throw new BadRequestException(data.errmsg || '微信登录失败');
    return data;
  }

  private async fetchWechatPhone(code: string): Promise<string | undefined> {
    const accessToken = await this.fetchWechatAccessToken();
    const res = await fetch(`https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.errcode) throw new BadRequestException(data.errmsg || '获取手机号失败');
    return data.phone_info?.phoneNumber || data.phone_info?.purePhoneNumber;
  }

  private async fetchWechatAccessToken(): Promise<string> {
    const appid = this.configService.get<string>('WECHAT_APPID');
    const secret = this.configService.get<string>('WECHAT_SECRET');
    if (!appid || !secret) {
      throw new BadRequestException('后端未配置 WECHAT_APPID/WECHAT_SECRET');
    }
    const res = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(appid)}&secret=${encodeURIComponent(secret)}`);
    const data = await res.json();
    if (data.errcode) throw new BadRequestException(data.errmsg || '获取微信 access_token 失败');
    return data.access_token;
  }

  private generateAccessToken(user: LxWxuser) {
    return this.jwtService.sign(
      { sub: user.id, type: 'app', mobile: user.mobile },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRE_TIME') as StringValue,
      },
    );
  }

  private async generateRefreshToken(user: LxWxuser, openid: string | null | undefined, req: any) {
    const token = this.jwtService.sign(
      { sub: user.id, type: 'app-refresh', jti: randomUUID() },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE_TIME') as StringValue,
      },
    );
    const expiresTime = new Date();
    expiresTime.setDate(expiresTime.getDate() + 7);
    await this.appRefreshTokenRepo.save(this.appRefreshTokenRepo.create({
      token,
      userId: user.id,
      expiresTime,
      openid: openid || null,
      isRevoked: false,
      deviceInfo: req?.headers?.['user-agent'] || null,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
    }));
    await this.appRefreshTokenRepo.delete({ expiresTime: LessThan(new Date()) });
    return token;
  }

  private extractToken(authorization?: string, tokenHeader?: string) {
    if (authorization?.startsWith('Bearer ')) return authorization.slice(7);
    return tokenHeader || '';
  }

  private verifyAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: this.configService.get<string>('JWT_SECRET') });
      if (payload.type !== 'app') throw new Error('invalid token type');
      return payload;
    } catch {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }
  }

  private mapWxUser(user: LxWxuser) {
    return {
      ...user,
      avatarUrl: user.avaterUrl,
      avatar: user.avaterUrl,
      name: user.userName,
    };
  }
}
