import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BENEFIT_BUSINESS_CATEGORIES } from '../student-business.domain-groups';
import { CreateStudentBusinessItemDto } from '../dto/create-student-business-item.dto';
import { QueryStudentBusinessItemDto } from '../dto/query-student-business-item.dto';
import { UpdateStudentBusinessItemDto } from '../dto/update-student-business-item.dto';
import { StudentBusinessDomainService } from './student-business-domain.service';
import { LxCard } from '../entities/lx-card.entity';
import { LxVip } from '../entities/lx-vip.entity';
import { LxWelfare } from '../entities/lx-welfare.entity';
import { LxWxuser } from '../entities/lx-wxuser.entity';
import { BusinessContentCategory } from '../entities/business-content-category.entity';

@Injectable()
export class BenefitBusinessService extends StudentBusinessDomainService {
  constructor(
    @InjectRepository(LxVip)
    private readonly vipRepo: Repository<LxVip>,
    @InjectRepository(LxWelfare)
    private readonly welfareRepo: Repository<LxWelfare>,
    @InjectRepository(LxCard)
    private readonly cardRepo: Repository<LxCard>,
    @InjectRepository(LxWxuser)
    private readonly wxuserRepo: Repository<LxWxuser>,
    @InjectRepository(BusinessContentCategory)
    private readonly categoryRepo: Repository<BusinessContentCategory>,
  ) {
    super(BENEFIT_BUSINESS_CATEGORIES, '权益卡券业务');
  }

  create(createDto: CreateStudentBusinessItemDto) {
    this.assertSupported(createDto.category);

    if (createDto.category === 'vip') {
      return this.vipRepo.save(
        this.vipRepo.create({
          title: createDto.title,
          avaterUrl: createDto.coverImage ?? null,
          membershipDescribe:
            createDto.content ?? createDto.membershipDescribe ?? null,
          remark: createDto.summary ?? null,
          rule: createDto.rule ?? null,
          categoryId: createDto.categoryId ?? null,
          startTime: createDto.startTime ? new Date(createDto.startTime) : null,
          endTime: createDto.endTime ? new Date(createDto.endTime) : null,
          createBy: null,
        }),
      );
    }

    if (createDto.category === 'welfare') {
      return this.welfareRepo.save(
        this.welfareRepo.create({
          title: createDto.title,
          avaterUrl: createDto.coverImage ?? null,
          money:
            createDto.money !== undefined && createDto.money !== null
              ? String(createDto.money)
              : null,
          discountType: createDto.discountType ?? null,
          discount: createDto.discount ?? null,
          remark: createDto.summary ?? null,
          rule: createDto.content ?? createDto.rule ?? null,
          categoryId: createDto.categoryId ?? null,
          startTime: createDto.startTime ? new Date(createDto.startTime) : null,
          endTime: createDto.endTime ? new Date(createDto.endTime) : null,
          createBy: null,
        }),
      );
    }

    return this.cardRepo.save(
      this.cardRepo.create({
        cardId: this.normalizeBigIntString(createDto.title, '卡券ID'),
        userId: this.normalizeBigIntString(
          createDto.subTitle ?? createDto.userId,
          '用户ID',
        ),
        type: createDto.summary ?? null,
        status: createDto.source ?? null,
        useStatus: createDto.useStatus ?? null,
        createBy: null,
      }),
    );
  }

  async findAll(page: number, limit: number, query: QueryStudentBusinessItemDto) {
    this.assertSupported(query.category);
    const category = query.category as 'vip' | 'welfare' | 'card';
    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 10;
    const repo =
      category === 'vip'
        ? this.vipRepo
        : category === 'welfare'
          ? this.welfareRepo
          : this.cardRepo;
    const alias =
      category === 'vip'
        ? 'vip'
        : category === 'welfare'
          ? 'welfare'
          : 'card';
    const titleField = category === 'card' ? 'cardId' : 'title';
    const qb = repo.createQueryBuilder(alias);

    if (query.title) {
      qb.andWhere(`${alias}.${titleField} LIKE :title`, {
        title: `%${query.title}%`,
      });
    }

    if (category !== 'card' && query.categoryId !== undefined && query.categoryId !== null) {
      qb.andWhere(`${alias}.categoryId = :categoryId`, {
        categoryId: Number(query.categoryId),
      });
    }

    if (category === 'card') {
      return this.findCardPackages(currentPage, currentLimit, query);
    }

    qb.orderBy(`${alias}.createTime`, 'DESC').addOrderBy(`${alias}.id`, 'DESC');

    const [data, total] = await qb
      .skip((currentPage - 1) * currentLimit)
      .take(currentLimit)
      .getManyAndCount();

    return {
      data: data.map((item) => this.mapEntity(category, item as never)),
      meta: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    };
  }

  private async findCardPackages(
    currentPage: number,
    currentLimit: number,
    query: QueryStudentBusinessItemDto,
  ) {
    const baseQb = this.cardRepo.createQueryBuilder('card');

    if (query.title) {
      baseQb.andWhere('card.cardId LIKE :title', {
        title: `%${query.title}%`,
      });
    }

    const totalRaw = await baseQb
      .clone()
      .select('COUNT(DISTINCT card.userId)', 'total')
      .getRawOne<{ total: string }>();
    const total = Number(totalRaw?.total || 0);

    const userRows = await baseQb
      .clone()
      .select('card.userId', 'userId')
      .addSelect('MAX(card.createTime)', 'lastCreateTime')
      .groupBy('card.userId')
      .orderBy('lastCreateTime', 'DESC')
      .addOrderBy('card.userId', 'DESC')
      .offset((currentPage - 1) * currentLimit)
      .limit(currentLimit)
      .getRawMany<{ userId: string }>();
    const userIds = userRows.map((item) => String(item.userId));

    if (userIds.length === 0) {
      return {
        data: [],
        meta: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit),
        },
      };
    }

    const cardsQb = this.cardRepo
      .createQueryBuilder('card')
      .where('card.userId IN (:...userIds)', { userIds });

    if (query.title) {
      cardsQb.andWhere('card.cardId LIKE :title', {
        title: `%${query.title}%`,
      });
    }

    const cards = await cardsQb
      .orderBy('FIELD(card.user_id, :...userIds)')
      .addOrderBy('card.createTime', 'DESC')
      .addOrderBy('card.id', 'DESC')
      .setParameter('userIds', userIds)
      .getMany();

    return {
      data: await this.mapCardEntities(cards),
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
    const currentCategory = category as 'vip' | 'welfare' | 'card';
    const repo =
      currentCategory === 'vip'
        ? this.vipRepo
        : currentCategory === 'welfare'
          ? this.welfareRepo
          : this.cardRepo;
    const entity = await repo.findOne({ where: { id } });

    if (!entity) {
      throw new NotFoundException(`记录 ID ${id} 不存在`);
    }

    return this.mapEntity(currentCategory, entity as never);
  }

  async update(id: number, updateDto: UpdateStudentBusinessItemDto) {
    this.assertSupported(updateDto.category);

    if (updateDto.category === 'vip') {
      const entity = await this.vipRepo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`会员卡 ID ${id} 不存在`);
      }

      Object.assign(entity, {
        ...(updateDto.title !== undefined ? { title: updateDto.title } : {}),
        ...(updateDto.coverImage !== undefined
          ? { avaterUrl: updateDto.coverImage }
          : {}),
        ...(updateDto.content !== undefined ||
        updateDto.membershipDescribe !== undefined
          ? {
              membershipDescribe:
                updateDto.content ?? updateDto.membershipDescribe ?? null,
            }
          : {}),
        ...(updateDto.summary !== undefined ? { remark: updateDto.summary } : {}),
        ...(updateDto.rule !== undefined ? { rule: updateDto.rule } : {}),
        ...(updateDto.categoryId !== undefined
          ? { categoryId: updateDto.categoryId || null }
          : {}),
        ...(updateDto.startTime !== undefined
          ? { startTime: updateDto.startTime ? new Date(updateDto.startTime) : null }
          : {}),
        ...(updateDto.endTime !== undefined
          ? { endTime: updateDto.endTime ? new Date(updateDto.endTime) : null }
          : {}),
      });

      return this.vipRepo.save(entity);
    }

    if (updateDto.category === 'welfare') {
      const entity = await this.welfareRepo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`福利 ID ${id} 不存在`);
      }

      Object.assign(entity, {
        ...(updateDto.title !== undefined ? { title: updateDto.title } : {}),
        ...(updateDto.coverImage !== undefined
          ? { avaterUrl: updateDto.coverImage }
          : {}),
        ...(updateDto.money !== undefined
          ? { money: updateDto.money !== null ? String(updateDto.money) : null }
          : {}),
        ...(updateDto.discountType !== undefined
          ? { discountType: updateDto.discountType }
          : {}),
        ...(updateDto.discount !== undefined
          ? { discount: updateDto.discount }
          : {}),
        ...(updateDto.summary !== undefined ? { remark: updateDto.summary } : {}),
        ...(updateDto.content !== undefined || updateDto.rule !== undefined
          ? { rule: updateDto.content ?? updateDto.rule ?? null }
          : {}),
        ...(updateDto.categoryId !== undefined
          ? { categoryId: updateDto.categoryId || null }
          : {}),
        ...(updateDto.startTime !== undefined
          ? { startTime: updateDto.startTime ? new Date(updateDto.startTime) : null }
          : {}),
        ...(updateDto.endTime !== undefined
          ? { endTime: updateDto.endTime ? new Date(updateDto.endTime) : null }
          : {}),
      });

      return this.welfareRepo.save(entity);
    }

    const entity = await this.cardRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`卡包记录 ID ${id} 不存在`);
    }

    Object.assign(entity, {
      ...(updateDto.title !== undefined
        ? { cardId: this.normalizeBigIntString(updateDto.title, '卡券ID') }
        : {}),
      ...(updateDto.subTitle !== undefined || updateDto.userId !== undefined
        ? {
            userId: this.normalizeBigIntString(
              updateDto.subTitle ?? updateDto.userId ?? entity.userId,
              '用户ID',
            ),
          }
        : {}),
      ...(updateDto.summary !== undefined ? { type: updateDto.summary } : {}),
      ...(updateDto.source !== undefined ? { status: updateDto.source } : {}),
      ...(updateDto.useStatus !== undefined
        ? { useStatus: updateDto.useStatus }
        : {}),
    });

    return this.cardRepo.save(entity);
  }

  async remove(id: number, category: string) {
    this.assertSupported(category);
    if (category === 'vip') {
      const entity = await this.vipRepo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`会员卡 ID ${id} 不存在`);
      }

      await this.vipRepo.remove(entity);
      return { message: '删除成功', id };
    }

    if (category === 'welfare') {
      const entity = await this.welfareRepo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`福利 ID ${id} 不存在`);
      }

      await this.welfareRepo.remove(entity);
      return { message: '删除成功', id };
    }

    const entity = await this.cardRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`卡包记录 ID ${id} 不存在`);
    }

    await this.cardRepo.remove(entity);
    return { message: '删除成功', id };
  }

  async updateStatus(_id: number, _category: string, _status: number) {
    throw new BadRequestException('权益卡券业务域暂不支持统一状态切换接口');
  }

  listCategories(businessKey: string, includeDisabled = false) {
    return this.categoryRepo.find({
      where: includeDisabled ? { businessKey } : { businessKey, status: 0 },
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
  }

  async createCategory(body: Partial<BusinessContentCategory>) {
    if (!body.businessKey || !body.name) {
      throw new BadRequestException('请填写业务和分类名称');
    }
    if (!['vip', 'welfare'].includes(body.businessKey)) {
      throw new BadRequestException('权益分类仅支持会员卡和福利业务');
    }
    const code = body.code || this.createCategoryCode(body.name);
    return this.categoryRepo.save(
      this.categoryRepo.create({
        businessKey: body.businessKey,
        name: body.name,
        code,
        sortNumber: Number(body.sortNumber || 0),
        status: Number(body.status || 0),
      }),
    );
  }

  async updateCategory(id: number, body: Partial<BusinessContentCategory>) {
    const entity = await this.categoryRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('分类不存在');
    if (!['vip', 'welfare'].includes(entity.businessKey)) {
      throw new BadRequestException('当前接口仅允许维护权益分类');
    }
    Object.assign(entity, {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.code !== undefined
        ? { code: body.code || this.createCategoryCode(body.name || entity.name) }
        : {}),
      ...(body.sortNumber !== undefined
        ? { sortNumber: Number(body.sortNumber || 0) }
        : {}),
      ...(body.status !== undefined ? { status: Number(body.status || 0) } : {}),
    });
    return this.categoryRepo.save(entity);
  }

  async removeCategory(id: number) {
    const entity = await this.categoryRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('分类不存在');
    if (!['vip', 'welfare'].includes(entity.businessKey)) {
      throw new BadRequestException('当前接口仅允许维护权益分类');
    }
    await this.categoryRepo.remove(entity);
    return { message: '删除成功', id };
  }

  private normalizeBigIntString(value: unknown, label: string) {
    const normalized = `${value ?? ''}`.trim();
    if (!/^\d+$/.test(normalized)) {
      throw new BadRequestException(`${label}必须是数字`);
    }
    return normalized;
  }

  private mapEntity(
    category: 'vip' | 'welfare' | 'card',
    entity: LxVip | LxWelfare | LxCard,
  ) {
    if (category === 'vip') {
      const item = entity as LxVip;
      return {
        id: item.id,
        category,
        title: item.title,
        summary: item.remark ?? null,
        content: item.membershipDescribe ?? null,
        coverImage: item.avaterUrl ?? null,
        rule: item.rule ?? null,
        categoryId: item.categoryId ?? null,
        startTime: item.startTime ?? null,
        endTime: item.endTime ?? null,
        status: 0,
        sortNumber: 0,
        createTime: item.createTime,
      };
    }

    if (category === 'welfare') {
      const item = entity as LxWelfare;
      return {
        id: item.id,
        category,
        title: item.title,
        summary: item.remark ?? null,
        content: item.rule ?? null,
        coverImage: item.avaterUrl ?? null,
        money: item.money ? Number(item.money) : null,
        discountType: item.discountType ?? null,
        discount: item.discount ?? null,
        categoryId: item.categoryId ?? null,
        startTime: item.startTime ?? null,
        endTime: item.endTime ?? null,
        status: 0,
        sortNumber: 0,
        createTime: item.createTime,
      };
    }

    const item = entity as LxCard;
    return {
      id: item.id,
      category,
      title: String(item.cardId),
      subTitle: String(item.userId),
      summary: item.type ?? null,
      source: item.status ?? null,
      useStatus: item.useStatus ?? null,
      relationId: String(item.cardId),
      userId: String(item.userId),
      cardType: item.type ?? null,
      receiveStatus: item.status ?? null,
      status: 0,
      sortNumber: 0,
      createTime: item.createTime,
    };
  }

  private async mapCardEntities(cards: LxCard[]) {
    const vipIds = cards
      .filter((item) => item.type === '1')
      .map((item) => Number(item.cardId))
      .filter(Number.isFinite);
    const welfareIds = cards
      .filter((item) => item.type === '2')
      .map((item) => Number(item.cardId))
      .filter(Number.isFinite);
    const userIds = cards
      .map((item) => Number(item.userId))
      .filter(Number.isFinite);

    const [vips, welfares, users] = await Promise.all([
      vipIds.length
        ? this.vipRepo.find({ where: { id: In([...new Set(vipIds)]) } })
        : Promise.resolve([]),
      welfareIds.length
        ? this.welfareRepo.find({ where: { id: In([...new Set(welfareIds)]) } })
        : Promise.resolve([]),
      userIds.length
        ? this.wxuserRepo.find({ where: { id: In([...new Set(userIds)]) } })
        : Promise.resolve([]),
    ]);
    const vipMap = new Map(vips.map((item) => [Number(item.id), item]));
    const welfareMap = new Map(welfares.map((item) => [Number(item.id), item]));
    const userMap = new Map(users.map((item) => [Number(item.id), item]));

    return cards.map((item) => {
      const mapped = this.mapEntity('card', item);
      const card =
        item.type === '1'
          ? vipMap.get(Number(item.cardId))
          : item.type === '2'
            ? welfareMap.get(Number(item.cardId))
            : undefined;
      const user = userMap.get(Number(item.userId));

      return {
        ...mapped,
        cardTitle: card?.title ?? null,
        cardCoverImage:
          item.type === '1'
            ? (card as LxVip | undefined)?.avaterUrl ?? null
            : (card as LxWelfare | undefined)?.avaterUrl ?? null,
        userName: user?.userName ?? null,
        userNickName: user?.nickName ?? null,
        userMobile: user?.mobile ?? null,
        userAvatar: user?.avaterUrl ?? null,
      };
    });
  }

  private createCategoryCode(name: string) {
    return (
      name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
        .slice(0, 80) || `category-${Date.now()}`
    );
  }
}
