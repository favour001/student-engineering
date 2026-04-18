import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BENEFIT_BUSINESS_CATEGORIES } from '../student-business.domain-groups';
import { CreateStudentBusinessItemDto } from '../dto/create-student-business-item.dto';
import { QueryStudentBusinessItemDto } from '../dto/query-student-business-item.dto';
import { UpdateStudentBusinessItemDto } from '../dto/update-student-business-item.dto';
import { StudentBusinessDomainService } from './student-business-domain.service';
import { LxCard } from '../entities/lx-card.entity';
import { LxVip } from '../entities/lx-vip.entity';
import { LxWelfare } from '../entities/lx-welfare.entity';

@Injectable()
export class BenefitBusinessService extends StudentBusinessDomainService {
  constructor(
    @InjectRepository(LxVip)
    private readonly vipRepo: Repository<LxVip>,
    @InjectRepository(LxWelfare)
    private readonly welfareRepo: Repository<LxWelfare>,
    @InjectRepository(LxCard)
    private readonly cardRepo: Repository<LxCard>,
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
          startTime: createDto.startTime ? new Date(createDto.startTime) : null,
          endTime: createDto.endTime ? new Date(createDto.endTime) : null,
          createBy: 'system',
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
          startTime: createDto.startTime ? new Date(createDto.startTime) : null,
          endTime: createDto.endTime ? new Date(createDto.endTime) : null,
          createBy: 'system',
        }),
      );
    }

    return this.cardRepo.save(
      this.cardRepo.create({
        cardId: createDto.title,
        userId: createDto.subTitle ?? createDto.userId ?? '',
        type: createDto.summary ?? null,
        status: createDto.source ?? null,
        useStatus: createDto.useStatus ?? null,
        createBy: 'system',
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
      ...(updateDto.title !== undefined ? { cardId: updateDto.title } : {}),
      ...(updateDto.subTitle !== undefined || updateDto.userId !== undefined
        ? { userId: updateDto.subTitle ?? updateDto.userId ?? entity.userId }
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
      status: 0,
      sortNumber: 0,
      createTime: item.createTime,
    };
  }
}
