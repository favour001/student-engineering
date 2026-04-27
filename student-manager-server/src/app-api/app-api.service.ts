import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { AppRefreshToken } from './entities/app-refresh-token.entity';
import { LxActivity } from '../student-business/entities/lx-activity.entity';
import { LxArticle } from '../student-business/entities/lx-article.entity';
import { LxCard } from '../student-business/entities/lx-card.entity';
import { LxMemberStyle } from '../student-business/entities/lx-member-style.entity';
import { LxRuhui } from '../student-business/entities/lx-ruhui.entity';
import { LxSign } from '../student-business/entities/lx-sign.entity';
import { LxTweet } from '../student-business/entities/lx-tweet.entity';
import { LxUserBanner } from '../student-business/entities/lx-user-banner.entity';
import { LxUserNotice } from '../student-business/entities/lx-user-notice.entity';
import { LxVideo } from '../student-business/entities/lx-video.entity';
import { LxVip } from '../student-business/entities/lx-vip.entity';
import { LxWelfare } from '../student-business/entities/lx-welfare.entity';
import { LxWxuser } from '../student-business/entities/lx-wxuser.entity';
import { LxXiehui } from '../student-business/entities/lx-xiehui.entity';
import { SysDepartment } from '../sys-department/entities/sys-department.entity';
import { SysPost } from '../sys-post/entities/sys-post.entity';

type PageQuery = Record<string, string | number | undefined>;

@Injectable()
export class AppApiService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(AppRefreshToken) private readonly appRefreshTokenRepo: Repository<AppRefreshToken>,
    @InjectRepository(LxActivity) private readonly activityRepo: Repository<LxActivity>,
    @InjectRepository(LxArticle) private readonly articleRepo: Repository<LxArticle>,
    @InjectRepository(LxCard) private readonly cardRepo: Repository<LxCard>,
    @InjectRepository(LxMemberStyle) private readonly memberStyleRepo: Repository<LxMemberStyle>,
    @InjectRepository(LxRuhui) private readonly ruhuiRepo: Repository<LxRuhui>,
    @InjectRepository(LxSign) private readonly signRepo: Repository<LxSign>,
    @InjectRepository(LxTweet) private readonly tweetRepo: Repository<LxTweet>,
    @InjectRepository(LxUserBanner) private readonly bannerRepo: Repository<LxUserBanner>,
    @InjectRepository(LxUserNotice) private readonly noticeRepo: Repository<LxUserNotice>,
    @InjectRepository(LxVideo) private readonly videoRepo: Repository<LxVideo>,
    @InjectRepository(LxVip) private readonly vipRepo: Repository<LxVip>,
    @InjectRepository(LxWelfare) private readonly welfareRepo: Repository<LxWelfare>,
    @InjectRepository(LxWxuser) private readonly wxuserRepo: Repository<LxWxuser>,
    @InjectRepository(LxXiehui) private readonly xiehuiRepo: Repository<LxXiehui>,
    @InjectRepository(SysDepartment) private readonly departmentRepo: Repository<SysDepartment>,
    @InjectRepository(SysPost) private readonly postRepo: Repository<SysPost>,
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

  async getWxUser(id: number) {
    const user = await this.wxuserRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    return this.mapWxUser(user);
  }

  async updateWxUser(body: Record<string, any>) {
    const id = Number(body.id || body.userId);
    if (!id) throw new BadRequestException('缺少用户 ID');
    const user = await this.wxuserRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    Object.assign(user, {
      ...(body.userName !== undefined ? { userName: body.userName } : {}),
      ...(body.nickName !== undefined ? { nickName: body.nickName } : {}),
      ...(body.avaterUrl !== undefined || body.avatarUrl !== undefined ? { avaterUrl: body.avaterUrl ?? body.avatarUrl } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.archives !== undefined ? { archives: body.archives } : {}),
      ...(body.remark !== undefined ? { remark: body.remark } : {}),
    });
    return this.mapWxUser(await this.wxuserRepo.save(user));
  }

  async listBanners() {
    const data = await this.bannerRepo.find({
      where: { releases: 0 },
      order: { createTime: 'DESC', id: 'DESC' },
      take: 5,
    });
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      avaterUrl: item.avaterUrl,
      bannerUrl: item.avaterUrl,
      pointUrl: item.pointUrl,
    }));
  }

  async getBanner(id: number) {
    const item = await this.bannerRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('轮播不存在');
    return item;
  }

  async listArticles(query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const qb = this.articleRepo.createQueryBuilder('article');
    if (query.type !== undefined && query.type !== '') {
      qb.andWhere('article.type = :type', { type: String(query.type) });
    }
    qb.orderBy('article.orderNumber', 'DESC').addOrderBy('article.id', 'DESC');
    const [rows, total] = await qb.skip((pageNum - 1) * pageSize).take(pageSize).getManyAndCount();
    return { list: rows.map((item) => this.mapArticle(item)), total, pageNum, pageSize, hasMore: pageNum * pageSize < total };
  }

  async getArticle(id: number) {
    const item = await this.articleRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('文章不存在');
    return this.mapArticle(item);
  }

  async listNotices(query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const [rows, total] = await this.noticeRepo.findAndCount({
      where: { releases: 0 },
      order: { createTime: 'DESC', id: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    const list = rows.map((item) => ({
      id: item.id,
      noticeTitle: item.title,
      title: item.title,
      remark: item.remark,
      createTime: item.createTime,
    }));
    return query.pageNum || query.pageSize ? { list, total, pageNum, pageSize, hasMore: pageNum * pageSize < total } : list;
  }

  async getNotice(id: number) {
    const item = await this.noticeRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('公告不存在');
    return { id: item.id, noticeTitle: item.title, title: item.title, remark: item.remark, createTime: item.createTime };
  }

  async listActivities(query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const [rows, total] = await this.activityRepo.findAndCount({
      order: { createTime: 'DESC', id: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    const list = rows.map((item) => this.mapActivity(item));
    return query.pageNum || query.pageSize ? { list, total, pageNum, pageSize, hasMore: pageNum * pageSize < total } : list;
  }

  async getActivity(id: number, userId: number) {
    const item = await this.activityRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('活动不存在');
    const signList = await this.signRepo.find({ where: { activityId: String(id) }, order: { createTime: 'DESC' } });
    const users = signList.length
      ? await this.wxuserRepo.createQueryBuilder('wxuser')
          .where('wxuser.id IN (:...ids)', { ids: signList.map((sign) => Number(sign.userId)) })
          .getMany()
      : [];
    const successNumber = signList.length;
    const signed = userId ? signList.some((sign) => Number(sign.userId) === userId) : false;
    return {
      ...this.mapActivity(item),
      successNumber,
      signListVOS: users.map((user) => this.mapWxUser(user)),
      isSign: signed,
      statusName: this.getActivityStatusName(item, signed),
    };
  }

  async addSign(userId: number, activityId: number) {
    const existing = await this.signRepo.findOne({ where: { userId: String(userId), activityId: String(activityId) } });
    if (existing) return true;
    await this.signRepo.save(this.signRepo.create({ userId: String(userId), activityId: String(activityId), createBy: String(userId) }));
    return true;
  }

  async deleteSign(userId: number, activityId: number) {
    const existing = await this.signRepo.findOne({ where: { userId: String(userId), activityId: String(activityId) } });
    if (existing) await this.signRepo.remove(existing);
    return true;
  }

  async listCards(type: number, userId: number, scene: number, query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const sourceRepo = type === 1 ? this.vipRepo : this.welfareRepo;
    const [items, total] = await sourceRepo.findAndCount({
      order: { createTime: 'DESC', id: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    const records = userId
      ? await this.cardRepo.find({ where: { userId: String(userId), type: String(type) } })
      : [];
    const recordMap = new Map(records.map((record) => [String(record.cardId), record]));
    const list = items.map((item: LxVip | LxWelfare) => {
      const record = recordMap.get(String(item.id));
      const base = {
        id: String(record?.id || item.id),
        cardId: String(item.id),
        status: record?.status || (scene === 2 ? '2' : ''),
        useStatus: record?.useStatus || '1',
        type: String(type),
      };
      if (type === 1) {
        const vip = item as LxVip;
        return { ...base, vipTitle: vip.title, vipAvaterUrl: vip.avaterUrl, membershipDescribe: vip.membershipDescribe };
      }
      const welfare = item as LxWelfare;
      return { ...base, fuliTitle: welfare.title, fuliAvaterUrl: welfare.avaterUrl, money: welfare.money };
    });
    return query.pageNum || query.pageSize ? { list, total, pageNum, pageSize, hasMore: pageNum * pageSize < total } : list;
  }

  async getCardStatus(cardId: number, userId: number, type: number) {
    return this.cardRepo.findOne({ where: { cardId: String(cardId), userId: String(userId), type: String(type) } });
  }

  async receiveCard(id: number, _type: number) {
    const record = await this.cardRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('卡券记录不存在');
    record.status = '1';
    return this.cardRepo.save(record);
  }

  async useCard(id: number) {
    const record = await this.cardRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('卡券记录不存在');
    record.useStatus = '2';
    return this.cardRepo.save(record);
  }

  async getVip(id: number) {
    const item = await this.vipRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('会员福利不存在');
    return { id: item.id, title: item.title, avaterUrl: item.avaterUrl, remark: item.remark, rule: item.rule, startTime: item.startTime, endTime: item.endTime };
  }

  async getWelfare(id: number) {
    const item = await this.welfareRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('福利不存在');
    return { id: item.id, title: item.title, avaterUrl: item.avaterUrl, remark: item.remark, rule: item.rule, startTime: item.startTime, endTime: item.endTime, money: item.money };
  }

  async listTweets(query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const qb = this.tweetRepo.createQueryBuilder('tweet');
    if (query.tweetType) qb.andWhere('tweet.tweetType = :tweetType', { tweetType: String(query.tweetType) });
    qb.orderBy('tweet.createTime', 'DESC').addOrderBy('tweet.id', 'DESC');
    const [rows, total] = await qb.skip((pageNum - 1) * pageSize).take(pageSize).getManyAndCount();
    const list = rows.map((item) => ({ id: item.id, tweetTitle: item.tweetTitle, tweetType: item.tweetType, tweetImg: item.tweetImg, tweetContent: item.tweetContent, createTime: item.createTime }));
    return query.pageNum || query.pageSize ? { list, total, pageNum, pageSize, hasMore: pageNum * pageSize < total } : list;
  }

  async getTweet(id: number) {
    const item = await this.tweetRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('内容不存在');
    return item;
  }

  async listVideos(query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const [rows, total] = await this.videoRepo.findAndCount({
      where: { releases: 0 },
      order: { createTime: 'DESC', id: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    const list = rows.map((item) => ({ id: item.id, title: item.title, avaterUrl: item.avaterUrl, remark: item.remark, feeldId: item.feeldId, finderUserName: item.finderUserName }));
    return query.pageNum || query.pageSize ? { list, total, pageNum, pageSize, hasMore: pageNum * pageSize < total } : list;
  }

  async listUsers(query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const qb = this.memberStyleRepo.createQueryBuilder('member');
    if (query.name) {
      qb.andWhere('(member.userName LIKE :name OR member.displayName LIKE :name)', { name: `%${query.name}%` });
    }
    qb.orderBy('member.sortNumber', 'ASC').addOrderBy('member.orderNumber', 'ASC').addOrderBy('member.id', 'ASC');
    const [rows, total] = await qb.skip((pageNum - 1) * pageSize).take(pageSize).getManyAndCount();
    const list = rows.map((item) => this.mapMember(item));
    return query.pageNum || query.pageSize ? { list, total, pageNum, pageSize, hasMore: pageNum * pageSize < total } : list;
  }

  async getUser(id: number) {
    const item = await this.memberStyleRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('成员不存在');
    return this.mapMember(item);
  }

  async listPosts() {
    const rows = await this.postRepo.find({ where: { status: 0 }, order: { sortNumber: 'ASC', id: 'ASC' } });
    return rows.map((item) => ({ id: item.id, name: item.name, postName: item.name }));
  }

  async listDepartments() {
    const rows = await this.departmentRepo.find({ where: { status: 0 }, order: { sortNumber: 'ASC', id: 'ASC' } });
    return rows.map((item) => ({ id: item.id, name: item.name, deptName: item.name }));
  }

  async getAssociationIntro(id: number) {
    const item = await this.xiehuiRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('协会介绍不存在');
    return { id: item.id, title: item.title, avaterUrl: item.avaterUrl, remark: item.remark };
  }

  async getJoiningGuide(id: number) {
    const item = await this.ruhuiRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('入会须知不存在');
    return { id: item.id, title: item.title, avaterUrl: item.avaterUrl, remark: item.remark };
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

  private getPage(query: PageQuery, defaultSize: number) {
    const pageNum = Math.max(Number(query.pageNum || query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || query.limit || defaultSize), 1), 50);
    return { pageNum, pageSize };
  }

  private mapArticle(item: LxArticle) {
    return {
      id: item.id,
      title: item.title,
      articleUrl: item.articleUrl,
      avaterUrl: item.articleUrl,
      type: item.type,
      contentType: item.contentType,
      remark: item.remark,
      describe: item.remark,
      createTime: item.createTime,
    };
  }

  private mapActivity(item: LxActivity) {
    return {
      id: item.id,
      title: item.title,
      startTime: item.startTime,
      endTime: item.endTime,
      address: item.address,
      money: item.money,
      remark: item.remark,
      status: item.status,
      statusName: this.getActivityStatusName(item, false),
      avaterUrl: item.avaterUrl,
      labelName: item.labelName,
      contactName: item.contactName,
      contactMobile: item.contactMobile,
      signQuota: item.signQuota,
      signType: item.signType,
      createTime: item.createTime,
    };
  }

  private getActivityStatusName(item: LxActivity, signed: boolean) {
    if (signed) return '已报名';
    if (item.status === '5') return '已结束';
    if (item.endTime && new Date(item.endTime) < new Date()) return '已结束';
    return '报名中';
  }

  private mapMember(item: LxMemberStyle) {
    return {
      id: item.id,
      name: item.userName,
      nickName: item.displayName || item.userName,
      avatarUrl: item.avatarUrl,
      avaterUrl: item.avatarUrl,
      postName: item.jobTitle,
      deptName: item.memberRank,
      company: item.companyRemark,
      introduce: item.honorRemark,
      remark: item.honorRemark,
      content: item.honorRemark,
    };
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
