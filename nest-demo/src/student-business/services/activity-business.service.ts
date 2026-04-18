import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ACTIVITY_BUSINESS_CATEGORIES } from '../student-business.domain-groups';
import { CreateStudentBusinessItemDto } from '../dto/create-student-business-item.dto';
import { QueryStudentBusinessItemDto } from '../dto/query-student-business-item.dto';
import { UpdateStudentBusinessItemDto } from '../dto/update-student-business-item.dto';
import { StudentBusinessDomainService } from './student-business-domain.service';
import { LxActivity } from '../entities/lx-activity.entity';
import { LxSign } from '../entities/lx-sign.entity';

@Injectable()
export class ActivityBusinessService extends StudentBusinessDomainService {
  constructor(
    @InjectRepository(LxActivity)
    private readonly activityRepo: Repository<LxActivity>,
    @InjectRepository(LxSign)
    private readonly signRepo: Repository<LxSign>,
  ) {
    super(ACTIVITY_BUSINESS_CATEGORIES, '活动业务');
  }

  create(createDto: CreateStudentBusinessItemDto) {
    this.assertSupported(createDto.category);

    if (createDto.category === 'activity') {
      const entity = this.activityRepo.create({
        title: createDto.title,
        remark: createDto.summary ?? null,
        avaterUrl: createDto.coverImage ?? null,
        labelName: createDto.source ?? null,
        contactName: createDto.author ?? createDto.contactName ?? null,
        contactMobile: createDto.mobile ?? createDto.contactMobile ?? null,
        startTime: createDto.startTime ? new Date(createDto.startTime) : null,
        endTime: createDto.endTime ? new Date(createDto.endTime) : null,
        address: createDto.address ?? null,
        money:
          createDto.money !== undefined && createDto.money !== null
            ? String(createDto.money)
            : null,
        signQuota: createDto.quantity ?? 0,
        signType: createDto.extraType ?? null,
        status: createDto.extraType ?? null,
        createBy: 'system',
      });

      return this.activityRepo.save(entity);
    }

    const entity = this.signRepo.create({
      userId: createDto.title,
      activityId: createDto.subTitle ?? createDto.relationId ?? '',
      createBy: 'system',
    });

    return this.signRepo.save(entity);
  }

  async findAll(page: number, limit: number, query: QueryStudentBusinessItemDto) {
    this.assertSupported(query.category);

    if (query.category === 'activity') {
      const currentPage = Number(page) || 1;
      const currentLimit = Number(limit) || 10;
      const qb = this.activityRepo.createQueryBuilder('activity');

      if (query.title) {
        qb.andWhere('activity.title LIKE :title', { title: `%${query.title}%` });
      }

      qb.orderBy('activity.createTime', 'DESC').addOrderBy('activity.id', 'DESC');

      const [data, total] = await qb
        .skip((currentPage - 1) * currentLimit)
        .take(currentLimit)
        .getManyAndCount();

      return {
        data: data.map((item) => ({
          id: item.id,
          category: 'activity',
          title: item.title,
          summary: item.remark ?? null,
          coverImage: item.avaterUrl ?? null,
          source: item.labelName ?? null,
          author: item.contactName ?? null,
          mobile: item.contactMobile ?? null,
          startTime: item.startTime ?? null,
          endTime: item.endTime ?? null,
          address: item.address ?? null,
          money: item.money ? Number(item.money) : null,
          quantity: item.signQuota ?? 0,
          extraType: item.signType ?? null,
          status: 0,
          sortNumber: 0,
          createTime: item.createTime,
        })),
        meta: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit),
        },
      };
    }

    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 10;
    const qb = this.signRepo.createQueryBuilder('sign');

    if (query.title) {
      qb.andWhere('sign.userId LIKE :title', { title: `%${query.title}%` });
    }

    qb.orderBy('sign.createTime', 'DESC').addOrderBy('sign.id', 'DESC');

    const [data, total] = await qb
      .skip((currentPage - 1) * currentLimit)
      .take(currentLimit)
      .getManyAndCount();

    return {
      data: data.map((item) => ({
        id: item.id,
        category: 'sign',
        title: String(item.userId),
        subTitle: String(item.activityId),
        userId: String(item.userId),
        relationId: String(item.activityId),
        status: 0,
        sortNumber: 0,
        createTime: item.createTime,
      })),
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

    if (category === 'activity') {
      const entity = await this.activityRepo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`活动 ID ${id} 不存在`);
      }

      return {
        id: entity.id,
        category,
        title: entity.title,
        summary: entity.remark ?? null,
        coverImage: entity.avaterUrl ?? null,
        source: entity.labelName ?? null,
        author: entity.contactName ?? null,
        mobile: entity.contactMobile ?? null,
        startTime: entity.startTime ?? null,
        endTime: entity.endTime ?? null,
        address: entity.address ?? null,
        money: entity.money ? Number(entity.money) : null,
        quantity: entity.signQuota ?? 0,
        extraType: entity.signType ?? null,
        status: 0,
        sortNumber: 0,
        createTime: entity.createTime,
      };
    }

    const entity = await this.signRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`报名记录 ID ${id} 不存在`);
    }

    return {
      id: entity.id,
      category,
      title: String(entity.userId),
      subTitle: String(entity.activityId),
      userId: String(entity.userId),
      relationId: String(entity.activityId),
      status: 0,
      sortNumber: 0,
      createTime: entity.createTime,
    };
  }

  async update(id: number, updateDto: UpdateStudentBusinessItemDto) {
    this.assertSupported(updateDto.category);

    if (updateDto.category === 'activity') {
      const entity = await this.activityRepo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`活动 ID ${id} 不存在`);
      }

      Object.assign(entity, {
        ...(updateDto.title !== undefined ? { title: updateDto.title } : {}),
        ...(updateDto.summary !== undefined ? { remark: updateDto.summary } : {}),
        ...(updateDto.coverImage !== undefined
          ? { avaterUrl: updateDto.coverImage }
          : {}),
        ...(updateDto.source !== undefined ? { labelName: updateDto.source } : {}),
        ...(updateDto.author !== undefined || updateDto.contactName !== undefined
          ? { contactName: updateDto.author ?? updateDto.contactName ?? null }
          : {}),
        ...(updateDto.mobile !== undefined ||
        updateDto.contactMobile !== undefined
          ? { contactMobile: updateDto.mobile ?? updateDto.contactMobile ?? null }
          : {}),
        ...(updateDto.startTime !== undefined
          ? { startTime: updateDto.startTime ? new Date(updateDto.startTime) : null }
          : {}),
        ...(updateDto.endTime !== undefined
          ? { endTime: updateDto.endTime ? new Date(updateDto.endTime) : null }
          : {}),
        ...(updateDto.address !== undefined ? { address: updateDto.address } : {}),
        ...(updateDto.money !== undefined
          ? { money: updateDto.money !== null ? String(updateDto.money) : null }
          : {}),
        ...(updateDto.quantity !== undefined
          ? { signQuota: updateDto.quantity }
          : {}),
        ...(updateDto.extraType !== undefined
          ? { signType: updateDto.extraType }
          : {}),
      });

      return this.activityRepo.save(entity);
    }

    const entity = await this.signRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`报名记录 ID ${id} 不存在`);
    }

    Object.assign(entity, {
      ...(updateDto.title !== undefined ? { userId: updateDto.title } : {}),
      ...(updateDto.subTitle !== undefined || updateDto.relationId !== undefined
        ? { activityId: updateDto.subTitle ?? updateDto.relationId ?? entity.activityId }
        : {}),
    });

    return this.signRepo.save(entity);
  }

  async remove(id: number, category: string) {
    this.assertSupported(category);

    if (category === 'activity') {
      const entity = await this.activityRepo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`活动 ID ${id} 不存在`);
      }

      await this.activityRepo.remove(entity);
      return { message: '删除成功', id };
    }

    const entity = await this.signRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`报名记录 ID ${id} 不存在`);
    }

    await this.signRepo.remove(entity);
    return { message: '删除成功', id };
  }

  async updateStatus(_id: number, _category: string, _status: number) {
    throw new BadRequestException('活动业务域暂不支持统一状态切换接口');
  }
}
