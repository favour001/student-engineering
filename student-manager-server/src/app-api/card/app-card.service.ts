import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { LxCard } from '../../student-business/entities/lx-card.entity';
import { LxVip } from '../../student-business/entities/lx-vip.entity';
import { LxWelfare } from '../../student-business/entities/lx-welfare.entity';
import { BusinessContentCategory } from '../../student-business/entities/business-content-category.entity';

type PageQuery = Record<string, string | number | undefined>;

@Injectable()
export class AppCardService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(LxCard) private readonly cardRepo: Repository<LxCard>,
    @InjectRepository(LxVip) private readonly vipRepo: Repository<LxVip>,
    @InjectRepository(LxWelfare) private readonly welfareRepo: Repository<LxWelfare>,
    @InjectRepository(BusinessContentCategory) private readonly categoryRepo: Repository<BusinessContentCategory>
  ) {}

  async listCards(type: number, userId: number, scene: number, query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const sourceRepo = type === 1 ? this.vipRepo : this.welfareRepo;
    const categoryId = Number(query.categoryId || 0);
    const [items, total] = await sourceRepo.findAndCount({
      where: categoryId > 0 ? { categoryId } : {},
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

  listCategories(type: number) {
    const businessKey = type === 1 ? 'vip' : 'welfare';
    return this.categoryRepo.find({
      where: { businessKey, status: 0 },
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
  }

  async getCardStatus(cardId: number, userId: number, type: number) {
    return this.cardRepo.findOne({ where: { cardId: String(cardId), userId: String(userId), type: String(type) } });
  }

  async getCardDetail(type: number, id: number) {
    return type === 1 ? this.getVip(id) : this.getWelfare(id);
  }

  async receiveCard(id: number, _type: number) {
    const record = await this.cardRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('卡券记录不存在');
    record.status = '1';
    return this.cardRepo.save(record);
  }

  async receiveCardByCardId(cardId: number, userId: number, type: number) {
    if (!cardId || !userId || !type) throw new BadRequestException('缺少卡券领取参数');
    let record = await this.cardRepo.findOne({
      where: { cardId: String(cardId), userId: String(userId), type: String(type) },
    });
    if (!record) {
      record = this.cardRepo.create({
        cardId: String(cardId),
        userId: String(userId),
        type: String(type),
        useStatus: '1',
      });
    }
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
    return { id: item.id, type: '1', title: item.title, avaterUrl: item.avaterUrl, remark: item.remark, rule: item.rule, startTime: item.startTime, endTime: item.endTime, membershipDescribe: item.membershipDescribe };
  }

  async getWelfare(id: number) {
    const item = await this.welfareRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('福利不存在');
    return { id: item.id, type: '2', title: item.title, avaterUrl: item.avaterUrl, remark: item.remark, rule: item.rule, startTime: item.startTime, endTime: item.endTime, money: item.money };
  }

  private getPage(query: PageQuery, defaultSize: number) {
    const pageNum = Math.max(Number(query.pageNum || query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || query.limit || defaultSize), 1), 50);
    return { pageNum, pageSize };
  }
}
