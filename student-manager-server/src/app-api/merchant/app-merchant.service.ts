import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { LxMerchant } from '../../student-business/entities/lx-merchant.entity';
import { BusinessContentCategory } from '../../student-business/entities/business-content-category.entity';

type PageQuery = Record<string, string | number | undefined>;

@Injectable()
export class AppMerchantService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(LxMerchant) private readonly merchantRepo: Repository<LxMerchant>,
    @InjectRepository(BusinessContentCategory) private readonly categoryRepo: Repository<BusinessContentCategory>
  ) {}

  async listMerchants(query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const categoryId = Number(query.categoryId || 0);
    const [rows, total] = await this.merchantRepo.findAndCount({
      where: categoryId > 0 ? { categoryId } : {},
      order: { createTime: 'DESC', id: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    const list = rows.map((item) => ({
      id: item.id,
      title: item.title,
      avaterUrl: item.coverUrl,
      remark: item.content,
      categoryId: item.categoryId,
      createTime: item.createTime,
    }));
    return query.pageNum || query.pageSize ? { list, total, pageNum, pageSize, hasMore: pageNum * pageSize < total } : list;
  }

  async getMerchant(id: number) {
    const item = await this.merchantRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('留学服务不存在');
    return {
      id: item.id,
      title: item.title,
      avaterUrl: item.coverUrl,
      remark: item.content,
      categoryId: item.categoryId,
      createTime: item.createTime,
    };
  }

  listCategories() {
    return this.categoryRepo.find({
      where: { businessKey: 'service-platform', status: 0 },
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
  }

  private getPage(query: PageQuery, defaultSize: number) {
    const pageNum = Math.max(Number(query.pageNum || query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || query.limit || defaultSize), 1), 50);
    return { pageNum, pageSize };
  }
}
