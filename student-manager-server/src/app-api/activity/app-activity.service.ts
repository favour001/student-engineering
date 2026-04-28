import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { LxActivity } from '../../student-business/entities/lx-activity.entity';
import { LxSign } from '../../student-business/entities/lx-sign.entity';
import { LxWxuser } from '../../student-business/entities/lx-wxuser.entity';

type PageQuery = Record<string, string | number | undefined>;

@Injectable()
export class AppActivityService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(LxActivity) private readonly activityRepo: Repository<LxActivity>,
    @InjectRepository(LxSign) private readonly signRepo: Repository<LxSign>,
    @InjectRepository(LxWxuser) private readonly wxuserRepo: Repository<LxWxuser>
  ) {}

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

  private getPage(query: PageQuery, defaultSize: number) {
    const pageNum = Math.max(Number(query.pageNum || query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || query.limit || defaultSize), 1), 50);
    return { pageNum, pageSize };
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

  private mapWxUser(user: LxWxuser) {
    return {
      ...user,
      avatarUrl: user.avaterUrl,
      avatar: user.avaterUrl,
      name: user.userName,
    };
  }
}
