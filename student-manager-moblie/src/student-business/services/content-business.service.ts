import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CONTENT_BUSINESS_CATEGORIES } from '../student-business.domain-groups';
import { CreateStudentBusinessItemDto } from '../dto/create-student-business-item.dto';
import { QueryStudentBusinessUserPickerDto } from '../dto/query-student-business-user-picker.dto';
import { LxArticle } from '../entities/lx-article.entity';
import { LxInformation } from '../entities/lx-information.entity';
import { LxMerchant } from '../entities/lx-merchant.entity';
import { LxMerchantUser } from '../entities/lx-merchant-user.entity';
import { LxTweet } from '../entities/lx-tweet.entity';
import { LxUserBanner } from '../entities/lx-user-banner.entity';
import { LxUserJin } from '../entities/lx-user-jin.entity';
import { LxUserNotice } from '../entities/lx-user-notice.entity';
import { LxVideo } from '../entities/lx-video.entity';
import { LxWxuser } from '../entities/lx-wxuser.entity';
import { QueryStudentBusinessItemDto } from '../dto/query-student-business-item.dto';
import { UpdateStudentBusinessItemDto } from '../dto/update-student-business-item.dto';
import { StudentBusinessDomainService } from './student-business-domain.service';

@Injectable()
export class ContentBusinessService extends StudentBusinessDomainService {
  constructor(
    @InjectRepository(LxUserNotice)
    private readonly noticeRepo: Repository<LxUserNotice>,
    @InjectRepository(LxArticle)
    private readonly articleRepo: Repository<LxArticle>,
    @InjectRepository(LxTweet)
    private readonly tweetRepo: Repository<LxTweet>,
    @InjectRepository(LxInformation)
    private readonly informationRepo: Repository<LxInformation>,
    @InjectRepository(LxVideo)
    private readonly videoRepo: Repository<LxVideo>,
    @InjectRepository(LxUserBanner)
    private readonly bannerRepo: Repository<LxUserBanner>,
    @InjectRepository(LxUserJin)
    private readonly quickAccessRepo: Repository<LxUserJin>,
    @InjectRepository(LxMerchant)
    private readonly merchantRepo: Repository<LxMerchant>,
    @InjectRepository(LxMerchantUser)
    private readonly merchantUserRepo: Repository<LxMerchantUser>,
    @InjectRepository(LxWxuser)
    private readonly wxuserRepo: Repository<LxWxuser>,
  ) {
    super(CONTENT_BUSINESS_CATEGORIES, '内容发布业务');
  }

  create(createDto: CreateStudentBusinessItemDto) {
    this.assertSupported(createDto.category);

    switch (createDto.category) {
      case 'notice':
        return this.noticeRepo.save(
          this.noticeRepo.create({
            title: createDto.title,
            remark: createDto.summary ?? null,
            releases: createDto.status ?? 0,
            createBy: 'system',
          }),
        );
      case 'article':
        return this.articleRepo.save(
          this.articleRepo.create({
            title: createDto.title,
            type: createDto.subTitle ?? null,
            remark: createDto.summary ?? null,
            contentType: createDto.content ?? null,
            articleUrl: createDto.externalUrl ?? null,
            orderNumber: createDto.sortNumber ?? 0,
            createBy: 'system',
          }),
        );
      case 'innovation-shunde':
        return this.tweetRepo.save(
          this.tweetRepo.create({
            tweetTitle: createDto.title,
            tweetType: createDto.subTitle ?? null,
            tweetContent: createDto.content ?? null,
            tweetImg: createDto.coverImage ?? null,
            createBy: 'system',
          }),
        );
      case 'study-abroad-news':
        return this.informationRepo.save(
          this.informationRepo.create({
            title: createDto.title,
            contentType: createDto.subTitle ?? null,
            remark: createDto.summary ?? null,
            informationContent: createDto.content ?? null,
            informationUrl: createDto.externalUrl ?? null,
            type: createDto.source ?? null,
            orderNumber: createDto.sortNumber ?? 0,
            createBy: 'system',
          }),
        );
      case 'video':
        return this.videoRepo.save(
          this.videoRepo.create({
            title: createDto.title,
            remark: createDto.summary ?? null,
            avaterUrl: createDto.coverImage ?? null,
            feeldId: createDto.source ?? null,
            finderUserName: createDto.author ?? null,
            releases: createDto.status ?? 0,
            createBy: 'system',
          }),
        );
      case 'banner':
        return this.bannerRepo.save(
          this.bannerRepo.create({
            title: createDto.title,
            avaterUrl: createDto.coverImage ?? null,
            pointUrl: createDto.externalUrl ?? null,
            releases: createDto.status ?? 0,
            createBy: 'system',
          }),
        );
      case 'quick-access':
        return this.quickAccessRepo.save(
          this.quickAccessRepo.create({
            title: createDto.title,
            remark: createDto.summary ?? null,
            avaterUrl: createDto.coverImage ?? null,
            pointUrl: createDto.externalUrl ?? null,
            releases: createDto.status ?? 0,
            createBy: 'system',
          }),
        );
      case 'merchant':
      case 'service-platform':
        return this.merchantRepo.save(
          this.merchantRepo.create({
            title: createDto.title,
            content: createDto.content ?? createDto.summary ?? null,
            coverUrl: createDto.coverImage ?? null,
            createBy: 'system',
          }),
        );
      default:
        throw new BadRequestException(`不支持的内容分类: ${createDto.category}`);
    }
  }

  async findAll(page: number, limit: number, query: QueryStudentBusinessItemDto) {
    this.assertSupported(query.category);
    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 10;
    const config = this.getCategoryConfig(query.category!);
    const qb = config.repo.createQueryBuilder(config.alias);

    if (query.title) {
      qb.andWhere(`${config.alias}.${config.titleField} LIKE :title`, {
        title: `%${query.title}%`,
      });
    }

    if (config.statusField && query.status !== undefined && query.status !== null) {
      qb.andWhere(`${config.alias}.${config.statusField} = :status`, {
        status: Number(query.status),
      });
    }

    if (config.listSelectFields?.length) {
      qb.select(
        config.listSelectFields.map((field) => `${config.alias}.${field}`),
      );
    }

    qb.orderBy(`${config.alias}.${config.orderField}`, 'DESC').addOrderBy(
      `${config.alias}.id`,
      'DESC',
    );

    const [data, total] = await qb
      .skip((currentPage - 1) * currentLimit)
      .take(currentLimit)
      .getManyAndCount();

    return {
      data: data.map((item) => this.mapContentEntity(query.category!, item)),
      meta: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    };
  }

  async findOne(id: number, category: string) {
    this.assertSupported(category);
    const entity = await this.getCategoryConfig(category).repo.findOne({
      where: { id },
    });
    if (!entity) {
      throw new NotFoundException(`记录 ID ${id} 不存在`);
    }

    return this.mapContentEntity(category, entity);
  }

  async update(id: number, updateDto: UpdateStudentBusinessItemDto) {
    this.assertSupported(updateDto.category);
    const category = updateDto.category!;
    const repo = this.getCategoryConfig(category).repo;
    const entity = await repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`记录 ID ${id} 不存在`);
    }

    switch (category) {
      case 'notice':
        Object.assign(entity, {
          ...(updateDto.title !== undefined ? { title: updateDto.title } : {}),
          ...(updateDto.summary !== undefined ? { remark: updateDto.summary } : {}),
          ...(updateDto.status !== undefined ? { releases: updateDto.status } : {}),
        });
        break;
      case 'article':
        Object.assign(entity, {
          ...(updateDto.title !== undefined ? { title: updateDto.title } : {}),
          ...(updateDto.subTitle !== undefined ? { type: updateDto.subTitle } : {}),
          ...(updateDto.summary !== undefined ? { remark: updateDto.summary } : {}),
          ...(updateDto.content !== undefined ? { contentType: updateDto.content } : {}),
          ...(updateDto.externalUrl !== undefined
            ? { articleUrl: updateDto.externalUrl }
            : {}),
          ...(updateDto.sortNumber !== undefined
            ? { orderNumber: updateDto.sortNumber }
            : {}),
        });
        break;
      case 'innovation-shunde':
        Object.assign(entity, {
          ...(updateDto.title !== undefined ? { tweetTitle: updateDto.title } : {}),
          ...(updateDto.subTitle !== undefined
            ? { tweetType: updateDto.subTitle }
            : {}),
          ...(updateDto.content !== undefined
            ? { tweetContent: updateDto.content }
            : {}),
          ...(updateDto.coverImage !== undefined
            ? { tweetImg: updateDto.coverImage }
            : {}),
        });
        break;
      case 'study-abroad-news':
        Object.assign(entity, {
          ...(updateDto.title !== undefined ? { title: updateDto.title } : {}),
          ...(updateDto.subTitle !== undefined
            ? { contentType: updateDto.subTitle }
            : {}),
          ...(updateDto.summary !== undefined ? { remark: updateDto.summary } : {}),
          ...(updateDto.content !== undefined
            ? { informationContent: updateDto.content }
            : {}),
          ...(updateDto.externalUrl !== undefined
            ? { informationUrl: updateDto.externalUrl }
            : {}),
          ...(updateDto.source !== undefined ? { type: updateDto.source } : {}),
          ...(updateDto.sortNumber !== undefined
            ? { orderNumber: updateDto.sortNumber }
            : {}),
        });
        break;
      case 'video':
        Object.assign(entity, {
          ...(updateDto.title !== undefined ? { title: updateDto.title } : {}),
          ...(updateDto.summary !== undefined ? { remark: updateDto.summary } : {}),
          ...(updateDto.coverImage !== undefined
            ? { avaterUrl: updateDto.coverImage }
            : {}),
          ...(updateDto.source !== undefined ? { feeldId: updateDto.source } : {}),
          ...(updateDto.author !== undefined
            ? { finderUserName: updateDto.author }
            : {}),
          ...(updateDto.status !== undefined ? { releases: updateDto.status } : {}),
        });
        break;
      case 'banner':
      case 'quick-access':
        Object.assign(entity, {
          ...(updateDto.title !== undefined ? { title: updateDto.title } : {}),
          ...(updateDto.summary !== undefined ? { remark: updateDto.summary } : {}),
          ...(updateDto.coverImage !== undefined
            ? { avaterUrl: updateDto.coverImage }
            : {}),
          ...(updateDto.externalUrl !== undefined
            ? { pointUrl: updateDto.externalUrl }
            : {}),
          ...(updateDto.status !== undefined ? { releases: updateDto.status } : {}),
        });
        break;
      case 'merchant':
      case 'service-platform':
        Object.assign(entity, {
          ...(updateDto.title !== undefined ? { title: updateDto.title } : {}),
          ...(updateDto.content !== undefined
            ? { content: updateDto.content }
            : updateDto.summary !== undefined
              ? { content: updateDto.summary }
              : {}),
          ...(updateDto.coverImage !== undefined
            ? { coverUrl: updateDto.coverImage }
            : {}),
        });
        break;
      default:
        throw new BadRequestException(`不支持的内容分类: ${category}`);
    }

    return repo.save(entity);
  }

  async updateStatus(id: number, category: string, status: number) {
    this.assertSupported(category);
    const config = this.getCategoryConfig(category);
    if (!config.statusField) {
      throw new BadRequestException(`${category} 不支持统一状态切换接口`);
    }

    const entity = await config.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`记录 ID ${id} 不存在`);
    }

    entity[config.statusField] = status;
    return config.repo.save(entity);
  }

  async remove(id: number, category: string) {
    this.assertSupported(category);
    const repo = this.getCategoryConfig(category).repo;
    const entity = await repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`记录 ID ${id} 不存在`);
    }

    await repo.remove(entity);
    return { message: '删除成功', id };
  }

  async getAssignableMerchantUsers(
    merchantId: number,
    query: QueryStudentBusinessUserPickerDto,
  ) {
    const currentPage = Number(query.page) || 1;
    const currentLimit = Number(query.limit) || 10;
    const assignedRecords = await this.merchantUserRepo.find({
      where: {
        merchantId: String(merchantId),
      },
    });
    const assignedUserIds = assignedRecords.map((item) => Number(item.userId));
    const qb = this.wxuserRepo.createQueryBuilder('wxuser');

    if (assignedUserIds.length > 0) {
      qb.andWhere('wxuser.id NOT IN (:...assignedUserIds)', { assignedUserIds });
    }

    if (query.title) {
      qb.andWhere('wxuser.userName LIKE :title', { title: `%${query.title}%` });
    }

    if (query.mobile) {
      qb.andWhere('wxuser.mobile LIKE :mobile', { mobile: `%${query.mobile}%` });
    }

    qb.orderBy('wxuser.createTime', 'DESC').addOrderBy('wxuser.id', 'DESC');

    const [data, total] = await qb
      .skip((currentPage - 1) * currentLimit)
      .take(currentLimit)
      .getManyAndCount();

    return {
      data: data.map((item) => ({
        id: item.id,
        title: item.userName ?? '',
        subTitle: item.nickName ?? null,
        mobile: item.mobile ?? null,
        coverImage: item.avaterUrl ?? null,
      })),
      meta: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    };
  }

  async assignMerchantUsers(merchantId: number, userIds: number[]) {
    if (!userIds.length) {
      throw new BadRequestException('请选择至少一个用户');
    }

    const existing = await this.merchantUserRepo.find({
      where: {
        merchantId: String(merchantId),
      },
    });
    const existingUserIds = new Set(existing.map((item) => Number(item.userId)));
    const targets = userIds.filter((userId) => !existingUserIds.has(userId));

    if (!targets.length) {
      return { message: '所选用户已全部分配', count: 0 };
    }

    const entities = targets.map((userId) =>
      this.merchantUserRepo.create({
        merchantId: String(merchantId),
        userId: String(userId),
        createBy: 'system',
      }),
    );

    await this.merchantUserRepo.save(entities);
    return { message: '分配成功', count: entities.length };
  }

  async assignAllMerchantUsers(merchantId: number) {
    const allUsers = await this.wxuserRepo.find({
      order: { createTime: 'DESC', id: 'DESC' },
    });
    if (!allUsers.length) {
      return { message: '暂无可分配用户', count: 0 };
    }

    return this.assignMerchantUsers(
      merchantId,
      allUsers.map((item) => item.id),
    );
  }

  async revokeAllMerchantUsers(merchantId: number) {
    const records = await this.merchantUserRepo.find({
      where: {
        merchantId: String(merchantId),
      },
    });

    if (!records.length) {
      return { message: '暂无已分配用户', count: 0 };
    }

    await this.merchantUserRepo.remove(records);
    return { message: '撤销成功', count: records.length };
  }

  private getCategoryConfig(category: string): {
    repo: Repository<any>;
    alias: string;
    titleField: string;
    statusField?: string;
    orderField: string;
    listSelectFields?: string[];
  } {
    switch (category) {
      case 'notice':
        return {
          repo: this.noticeRepo,
          alias: 'notice',
          titleField: 'title',
          statusField: 'releases',
          orderField: 'createTime',
        };
      case 'article':
        return {
          repo: this.articleRepo,
          alias: 'article',
          titleField: 'title',
          orderField: 'orderNumber',
        };
      case 'innovation-shunde':
        return {
          repo: this.tweetRepo,
          alias: 'tweet',
          titleField: 'tweetTitle',
          orderField: 'createTime',
          listSelectFields: ['id', 'tweetTitle', 'tweetType', 'tweetImg', 'createTime'],
        };
      case 'study-abroad-news':
        return {
          repo: this.informationRepo,
          alias: 'information',
          titleField: 'title',
          orderField: 'orderNumber',
        };
      case 'video':
        return {
          repo: this.videoRepo,
          alias: 'video',
          titleField: 'title',
          statusField: 'releases',
          orderField: 'createTime',
        };
      case 'banner':
        return {
          repo: this.bannerRepo,
          alias: 'banner',
          titleField: 'title',
          statusField: 'releases',
          orderField: 'createTime',
        };
      case 'quick-access':
        return {
          repo: this.quickAccessRepo,
          alias: 'quickAccess',
          titleField: 'title',
          statusField: 'releases',
          orderField: 'createTime',
        };
      case 'merchant':
      case 'service-platform':
        return {
          repo: this.merchantRepo,
          alias: 'merchant',
          titleField: 'title',
          orderField: 'createTime',
        };
      default:
        throw new BadRequestException(`不支持的内容分类: ${category}`);
    }
  }

  private mapContentEntity(category: string, entity: Record<string, any>) {
    switch (category) {
      case 'notice':
        return {
          id: entity.id,
          category,
          title: entity.title,
          summary: entity.remark ?? null,
          status: Number(entity.releases ?? 0),
          sortNumber: 0,
          createTime: entity.createTime,
        };
      case 'article':
        return {
          id: entity.id,
          category,
          title: entity.title,
          subTitle: entity.type ?? null,
          summary: entity.remark ?? null,
          content: entity.contentType ?? null,
          externalUrl: entity.articleUrl ?? null,
          sortNumber: entity.orderNumber ?? 0,
          status: 0,
          createTime: entity.createTime,
        };
      case 'innovation-shunde':
        return {
          id: entity.id,
          category,
          title: entity.tweetTitle,
          subTitle: entity.tweetType ?? null,
          content: entity.tweetContent ?? null,
          coverImage: entity.tweetImg ?? null,
          sortNumber: 0,
          status: 0,
          createTime: entity.createTime,
        };
      case 'study-abroad-news':
        return {
          id: entity.id,
          category,
          title: entity.title,
          subTitle: entity.contentType ?? null,
          summary: entity.remark ?? null,
          content: entity.informationContent ?? null,
          externalUrl: entity.informationUrl ?? null,
          source: entity.type ?? null,
          sortNumber: entity.orderNumber ?? 0,
          status: 0,
          createTime: entity.createTime,
        };
      case 'video':
        return {
          id: entity.id,
          category,
          title: entity.title,
          summary: entity.remark ?? null,
          coverImage: entity.avaterUrl ?? null,
          source: entity.feeldId ?? null,
          author: entity.finderUserName ?? null,
          status: Number(entity.releases ?? 0),
          sortNumber: 0,
          createTime: entity.createTime,
        };
      case 'banner':
        return {
          id: entity.id,
          category,
          title: entity.title,
          coverImage: entity.avaterUrl ?? null,
          externalUrl: entity.pointUrl ?? null,
          status: Number(entity.releases ?? 0),
          sortNumber: 0,
          createTime: entity.createTime,
        };
      case 'quick-access':
        return {
          id: entity.id,
          category,
          title: entity.title,
          summary: entity.remark ?? null,
          coverImage: entity.avaterUrl ?? null,
          externalUrl: entity.pointUrl ?? null,
          status: Number(entity.releases ?? 0),
          sortNumber: 0,
          createTime: entity.createTime,
        };
      case 'merchant':
      case 'service-platform':
        return {
          id: entity.id,
          category: 'service-platform',
          title: entity.title,
          content: entity.content ?? null,
          summary: entity.content ?? null,
          coverImage: entity.coverUrl ?? null,
          sortNumber: 0,
          status: 0,
          createTime: entity.createTime,
        };
      default:
        throw new BadRequestException(`不支持的内容分类: ${category}`);
    }
  }
}
