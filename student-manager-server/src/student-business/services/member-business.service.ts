import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MEMBER_BUSINESS_CATEGORIES } from '../student-business.domain-groups';
import { CreateStudentBusinessItemDto } from '../dto/create-student-business-item.dto';
import { QueryStudentBusinessItemDto } from '../dto/query-student-business-item.dto';
import { QueryStudentBusinessUserPickerDto } from '../dto/query-student-business-user-picker.dto';
import { UpdateStudentBusinessItemDto } from '../dto/update-student-business-item.dto';
import { StudentBusinessDomainService } from './student-business-domain.service';
import { LxCard } from '../entities/lx-card.entity';
import { LxMemberStyle } from '../entities/lx-member-style.entity';
import { LxRuhui } from '../entities/lx-ruhui.entity';
import { LxWxuser } from '../entities/lx-wxuser.entity';
import { LxXiehui } from '../entities/lx-xiehui.entity';

type AssignCardType = 'vip' | 'welfare';

@Injectable()
export class MemberBusinessService extends StudentBusinessDomainService {
  constructor(
    @InjectRepository(LxMemberStyle)
    private readonly memberStyleRepo: Repository<LxMemberStyle>,
    @InjectRepository(LxXiehui)
    private readonly xiehuiRepo: Repository<LxXiehui>,
    @InjectRepository(LxRuhui)
    private readonly ruhuiRepo: Repository<LxRuhui>,
    @InjectRepository(LxWxuser)
    private readonly wxuserRepo: Repository<LxWxuser>,
    @InjectRepository(LxCard)
    private readonly cardRepo: Repository<LxCard>,
  ) {
    super(MEMBER_BUSINESS_CATEGORIES, '会员与组织业务');
  }

  async create(createDto: CreateStudentBusinessItemDto) {
    this.assertSupported(createDto.category);

    if (createDto.category === 'member-style') {
      const nextId = await this.getNextMemberStyleId();
      return this.memberStyleRepo.save(
        this.memberStyleRepo.create({
          id: nextId,
          legacyUserId: null,
          orderNumber:
            createDto.orderNumber !== undefined && createDto.orderNumber !== null
              ? Number(createDto.orderNumber)
              : null,
          userName: createDto.title,
          displayName: createDto.displayName ?? createDto.subTitle ?? null,
          jobTitle: createDto.jobTitle ?? null,
          postId: createDto.postId ?? null,
          deptId: createDto.deptId ?? null,
          memberRank: createDto.memberRank ?? null,
          joinedAt: createDto.publishedAt ? new Date(createDto.publishedAt) : null,
          mobile: createDto.mobile ?? null,
          email: createDto.email ?? null,
          gender: createDto.gender ?? null,
          avatarUrl: createDto.coverImage ?? null,
          backgroundUrl: createDto.backgroundImage ?? null,
          honorRemark: createDto.honorRemark ?? createDto.summary ?? null,
          graduationSchool: createDto.studySchool ?? null,
          studyArea: createDto.studyCountry ?? null,
          companyRemark: createDto.companyRemark ?? null,
          jobRemark: createDto.jobRemark ?? null,
          socialPostRemark: createDto.socialPost ?? null,
          sortNumber: createDto.sortNumber ?? 0,
          status: createDto.status ?? 0,
          createBy: 'system',
          createTime: new Date(),
          updateBy: 'system',
          updateTime: new Date(),
        }),
      );
    }

    if (createDto.category === 'association-intro') {
      return this.xiehuiRepo.save(
        this.xiehuiRepo.create({
          title: createDto.title,
          remark: createDto.summary ?? null,
          avaterUrl: createDto.coverImage ?? null,
          createBy: 'system',
        }),
      );
    }

    if (createDto.category === 'joining-guide') {
      return this.ruhuiRepo.save(
        this.ruhuiRepo.create({
          title: createDto.title,
          remark: createDto.summary ?? null,
          avaterUrl: createDto.coverImage ?? null,
          createBy: 'system',
        }),
      );
    }

    return this.wxuserRepo.save(this.wxuserRepo.create(this.mapWechatPayload(createDto)));
  }

  async findAll(page: number, limit: number, query: QueryStudentBusinessItemDto) {
    this.assertSupported(query.category);
    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 10;

    if (query.category === 'member-style') {
      const qb = this.memberStyleRepo.createQueryBuilder('member');

      if (query.title) {
        qb.andWhere(
          '(member.userName LIKE :title OR member.displayName LIKE :title OR member.jobTitle LIKE :title)',
          { title: `%${query.title}%` },
        );
      }
      if (query.postId) {
        qb.andWhere('member.postId = :postId', { postId: query.postId });
      }
      if (query.deptId) {
        qb.andWhere('member.deptId = :deptId', { deptId: query.deptId });
      }
      if (query.status !== undefined) {
        qb.andWhere('member.status = :status', { status: query.status });
      }

      qb.orderBy('member.sortNumber', 'ASC')
        .addOrderBy('member.orderNumber', 'ASC')
        .addOrderBy('member.id', 'ASC');

      const [data, total] = await qb
        .skip((currentPage - 1) * currentLimit)
        .take(currentLimit)
        .getManyAndCount();

      return {
        data: data.map((item) => this.mapMemberStyle(item)),
        meta: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit),
        },
      };
    }

    if (
      query.category === 'association-intro' ||
      query.category === 'joining-guide'
    ) {
      const repo =
        query.category === 'association-intro' ? this.xiehuiRepo : this.ruhuiRepo;
      const alias = query.category === 'association-intro' ? 'xiehui' : 'ruhui';
      const qb = repo.createQueryBuilder(alias);

      if (query.title) {
        qb.andWhere(`${alias}.title LIKE :title`, { title: `%${query.title}%` });
      }

      qb.orderBy(`${alias}.updateTime`, 'DESC').addOrderBy(`${alias}.id`, 'DESC');

      const [data, total] = await qb
        .skip((currentPage - 1) * currentLimit)
        .take(currentLimit)
        .getManyAndCount();

      return {
        data: data.map((item) => ({
          id: item.id,
          category: query.category,
          title: item.title,
          summary: item.remark ?? null,
          coverImage: item.avaterUrl ?? null,
          status: 0,
          sortNumber: 0,
          createTime: item.createTime,
          updateTime: item.updateTime,
        })),
        meta: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit),
        },
      };
    }

    const qb = this.wxuserRepo.createQueryBuilder('wxuser');

    if (query.title) {
      qb.andWhere('wxuser.userName LIKE :title', { title: `%${query.title}%` });
    }

    if (query.mobile) {
      qb.andWhere('wxuser.mobile LIKE :mobile', { mobile: `%${query.mobile}%` });
    }

    if (query.nickName) {
      qb.andWhere('wxuser.nickName LIKE :nickName', {
        nickName: `%${query.nickName}%`,
      });
    }

    if (query.vipFlag) {
      qb.andWhere('wxuser.vip = :vipFlag', { vipFlag: query.vipFlag });
    }

    if (query.auditStatus) {
      qb.andWhere('wxuser.status = :auditStatus', {
        auditStatus: query.auditStatus,
      });
    }

    qb.orderBy('wxuser.createTime', 'DESC').addOrderBy('wxuser.id', 'DESC');

    const [data, total] = await qb
      .skip((currentPage - 1) * currentLimit)
      .take(currentLimit)
      .getManyAndCount();

    return {
      data: data.map((item) => this.mapWechatUser(item)),
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

    if (category === 'member-style') {
      const entity = await this.memberStyleRepo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`成员 ID ${id} 不存在`);
      }

      return this.mapMemberStyle(entity);
    }

    if (category === 'association-intro' || category === 'joining-guide') {
      const repo = category === 'association-intro' ? this.xiehuiRepo : this.ruhuiRepo;
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`记录 ID ${id} 不存在`);
      }

      return {
        id: entity.id,
        category,
        title: entity.title,
        summary: entity.remark ?? null,
        coverImage: entity.avaterUrl ?? null,
        status: 0,
        sortNumber: 0,
        createTime: entity.createTime,
        updateTime: entity.updateTime,
      };
    }

    const entity = await this.wxuserRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`微信用户 ID ${id} 不存在`);
    }

    return this.mapWechatUser(entity);
  }

  async update(id: number, updateDto: UpdateStudentBusinessItemDto) {
    this.assertSupported(updateDto.category);

    if (updateDto.category === 'member-style') {
      const entity = await this.memberStyleRepo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`成员 ID ${id} 不存在`);
      }

      Object.assign(entity, {
        ...(updateDto.title !== undefined ? { userName: updateDto.title } : {}),
        ...(updateDto.displayName !== undefined || updateDto.subTitle !== undefined
          ? { displayName: updateDto.displayName ?? updateDto.subTitle ?? null }
          : {}),
        ...(updateDto.jobTitle !== undefined ? { jobTitle: updateDto.jobTitle } : {}),
        ...(updateDto.postId !== undefined ? { postId: updateDto.postId || null } : {}),
        ...(updateDto.deptId !== undefined ? { deptId: updateDto.deptId || null } : {}),
        ...(updateDto.memberRank !== undefined
          ? { memberRank: updateDto.memberRank }
          : {}),
        ...(updateDto.summary !== undefined || updateDto.honorRemark !== undefined
          ? { honorRemark: updateDto.honorRemark ?? updateDto.summary ?? null }
          : {}),
        ...(updateDto.coverImage !== undefined
          ? { avatarUrl: updateDto.coverImage }
          : {}),
        ...(updateDto.backgroundImage !== undefined
          ? { backgroundUrl: updateDto.backgroundImage }
          : {}),
        ...(updateDto.publishedAt !== undefined
          ? {
              joinedAt: updateDto.publishedAt
                ? new Date(updateDto.publishedAt)
                : null,
            }
          : {}),
        ...(updateDto.mobile !== undefined ? { mobile: updateDto.mobile } : {}),
        ...(updateDto.email !== undefined ? { email: updateDto.email } : {}),
        ...(updateDto.gender !== undefined ? { gender: updateDto.gender } : {}),
        ...(updateDto.studySchool !== undefined
          ? { graduationSchool: updateDto.studySchool }
          : {}),
        ...(updateDto.studyCountry !== undefined
          ? { studyArea: updateDto.studyCountry }
          : {}),
        ...(updateDto.companyRemark !== undefined
          ? { companyRemark: updateDto.companyRemark }
          : {}),
        ...(updateDto.jobRemark !== undefined
          ? { jobRemark: updateDto.jobRemark }
          : {}),
        ...(updateDto.socialPost !== undefined
          ? { socialPostRemark: updateDto.socialPost }
          : {}),
        ...(updateDto.orderNumber !== undefined
          ? {
              orderNumber:
                updateDto.orderNumber !== null
                  ? Number(updateDto.orderNumber)
                  : null,
            }
          : {}),
        ...(updateDto.sortNumber !== undefined
          ? { sortNumber: updateDto.sortNumber }
          : {}),
        ...(updateDto.status !== undefined ? { status: updateDto.status } : {}),
        updateBy: 'system',
        updateTime: new Date(),
      });

      return this.memberStyleRepo.save(entity);
    }

    if (
      updateDto.category === 'association-intro' ||
      updateDto.category === 'joining-guide'
    ) {
      const repo =
        updateDto.category === 'association-intro' ? this.xiehuiRepo : this.ruhuiRepo;
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`记录 ID ${id} 不存在`);
      }

      Object.assign(entity, {
        ...(updateDto.title !== undefined ? { title: updateDto.title } : {}),
        ...(updateDto.summary !== undefined ? { remark: updateDto.summary } : {}),
        ...(updateDto.coverImage !== undefined
          ? { avaterUrl: updateDto.coverImage }
          : {}),
      });

      return repo.save(entity);
    }

    const entity = await this.wxuserRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`微信用户 ID ${id} 不存在`);
    }

    Object.assign(entity, this.mapWechatPayload(updateDto));
    return this.wxuserRepo.save(entity);
  }

  async remove(id: number, category: string) {
    this.assertSupported(category);

    if (category === 'member-style') {
      const entity = await this.memberStyleRepo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`成员 ID ${id} 不存在`);
      }

      await this.memberStyleRepo.remove(entity);
      return { message: '删除成功', id };
    }

    if (category === 'association-intro' || category === 'joining-guide') {
      const repo = category === 'association-intro' ? this.xiehuiRepo : this.ruhuiRepo;
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`记录 ID ${id} 不存在`);
      }

      await repo.remove(entity);
      return { message: '删除成功', id };
    }

    const entity = await this.wxuserRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`微信用户 ID ${id} 不存在`);
    }

    await this.wxuserRepo.remove(entity);
    return { message: '删除成功', id };
  }

  async updateStatus(id: number, category: string, status: number) {
    this.assertSupported(category);

    if (category !== 'wechat-user') {
      throw new BadRequestException(`${category} 不支持统一状态切换接口`);
    }

    const entity = await this.wxuserRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`微信用户 ID ${id} 不存在`);
    }

    entity.status = String(status);
    return this.wxuserRepo.save(entity);
  }

  async getAssignableCardUsers(
    cardId: number,
    cardType: AssignCardType,
    query: QueryStudentBusinessUserPickerDto,
  ) {
    const currentPage = Number(query.page) || 1;
    const currentLimit = Number(query.limit) || 10;
    const assignedType = cardType === 'vip' ? '1' : '2';
    const assignedRecords = await this.cardRepo.find({
      where: {
        cardId: String(cardId),
        type: assignedType,
      },
    });
    const assignedUserIds = assignedRecords.map((item) => Number(item.userId));
    const qb = this.wxuserRepo.createQueryBuilder('wxuser');

    qb.andWhere('wxuser.vip = :vipFlag', { vipFlag: '1' });

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
      data: data.map((item) => this.mapWechatUser(item)),
      meta: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    };
  }

  async assignUsersToCard(
    cardId: number,
    cardType: AssignCardType,
    userIds: number[],
  ) {
    if (!userIds.length) {
      throw new BadRequestException('请选择至少一个用户');
    }

    const typeCode = cardType === 'vip' ? '1' : '2';
    const existing = await this.cardRepo.find({
      where: {
        cardId: String(cardId),
        type: typeCode,
      },
    });
    const existingUserIds = new Set(existing.map((item) => Number(item.userId)));
    const targets = userIds.filter((userId) => !existingUserIds.has(userId));

    if (!targets.length) {
      return { message: '所选用户已全部分配', count: 0 };
    }

    const entities = targets.map((userId) =>
      this.cardRepo.create({
        cardId: String(cardId),
        userId: String(userId),
        type: typeCode,
        status: '2',
        useStatus: cardType === 'welfare' ? '1' : null,
        createBy: 'system',
      }),
    );

    await this.cardRepo.save(entities);
    return { message: '分配成功', count: entities.length };
  }

  private mapWechatPayload(
    payload: Partial<CreateStudentBusinessItemDto | UpdateStudentBusinessItemDto>,
  ) {
    return {
      ...(payload.title !== undefined ? { userName: payload.title } : {}),
      ...(payload.userEnglishName !== undefined
        ? { userEnglishName: payload.userEnglishName }
        : {}),
      ...(payload.publishedAt !== undefined
        ? {
            regDate: payload.publishedAt ? new Date(payload.publishedAt) : null,
          }
        : {}),
      ...(payload.orderNumber !== undefined ? { order: payload.orderNumber } : {}),
      ...(payload.studyCountry !== undefined
        ? { liuxueGuo: payload.studyCountry }
        : {}),
      ...(payload.mobile !== undefined || payload.source !== undefined
        ? { mobile: payload.mobile ?? payload.source ?? null }
        : {}),
      ...(payload.studySchool !== undefined
        ? { liuxueSchool: payload.studySchool }
        : {}),
      ...(payload.major !== undefined ? { major: payload.major } : {}),
      ...(payload.certificate !== undefined
        ? { certificate: payload.certificate }
        : {}),
      ...(payload.gender !== undefined ? { gender: payload.gender } : {}),
      ...(payload.companyName !== undefined
        ? { companyName: payload.companyName }
        : {}),
      ...(payload.vipFlag !== undefined ? { vip: payload.vipFlag } : {}),
      ...(payload.companyPost !== undefined
        ? { companyPost: payload.companyPost }
        : {}),
      ...(payload.companyAddress !== undefined
        ? { companyAddress: payload.companyAddress }
        : {}),
      ...(payload.auditStatus !== undefined
        ? { status: payload.auditStatus }
        : {}),
      ...(payload.summary !== undefined ? { remark: payload.summary } : {}),
      ...(payload.socialPost !== undefined ? { post: payload.socialPost } : {}),
      ...(payload.nickName !== undefined || payload.subTitle !== undefined
        ? { nickName: payload.nickName ?? payload.subTitle ?? null }
        : {}),
      ...(payload.coverImage !== undefined
        ? { avaterUrl: payload.coverImage }
        : {}),
      ...(payload.email !== undefined ? { email: payload.email } : {}),
      ...(payload.nativePlace !== undefined
        ? { jiguan: payload.nativePlace }
        : {}),
      ...(payload.birthday !== undefined
        ? { birthday: payload.birthday ? new Date(payload.birthday) : null }
        : {}),
      ...(payload.author !== undefined ? { wxopenid: payload.author } : {}),
      ...(payload.content !== undefined ? { archives: payload.content } : {}),
      createBy: 'system',
    };
  }

  private mapWechatUser(entity: LxWxuser) {
    return {
      id: entity.id,
      category: 'wechat-user',
      title: entity.userName ?? '',
      subTitle: entity.nickName ?? null,
      summary: entity.remark ?? null,
      content: entity.archives ?? null,
      coverImage: entity.avaterUrl ?? null,
      source: entity.mobile ?? null,
      author: entity.wxopenid ?? null,
      mobile: entity.mobile ?? null,
      publishedAt: entity.regDate ?? null,
      status: Number(entity.status ?? 0),
      sortNumber: 0,
      createTime: entity.createTime,
      userEnglishName: entity.userEnglishName ?? null,
      orderNumber: entity.order ?? null,
      studyCountry: entity.liuxueGuo ?? null,
      studySchool: entity.liuxueSchool ?? null,
      major: entity.major ?? null,
      certificate: entity.certificate ?? null,
      gender: entity.gender ?? null,
      companyName: entity.companyName ?? null,
      vipFlag: entity.vip ?? null,
      companyPost: entity.companyPost ?? null,
      companyAddress: entity.companyAddress ?? null,
      auditStatus: entity.status ?? null,
      socialPost: entity.post ?? null,
      nickName: entity.nickName ?? null,
      email: entity.email ?? null,
      nativePlace: entity.jiguan ?? null,
      birthday: entity.birthday ?? null,
    };
  }

  private mapMemberStyle(entity: LxMemberStyle) {
    return {
      id: entity.id,
      category: 'member-style',
      title: entity.userName,
      subTitle: entity.displayName ?? null,
      summary: entity.honorRemark ?? null,
      coverImage: entity.avatarUrl ?? null,
      mobile: entity.mobile ?? null,
      publishedAt: entity.joinedAt ?? null,
      status: entity.status ?? 0,
      sortNumber: entity.sortNumber ?? 0,
      createTime: entity.createTime ?? null,
      updateTime: entity.updateTime ?? null,
      orderNumber:
        entity.orderNumber !== null && entity.orderNumber !== undefined
          ? String(entity.orderNumber)
          : null,
      displayName: entity.displayName ?? null,
      jobTitle: entity.jobTitle ?? null,
      postId: entity.postId ?? null,
      deptId: entity.deptId ?? null,
      memberRank: entity.memberRank ?? null,
      email: entity.email ?? null,
      gender: entity.gender ?? null,
      backgroundImage: entity.backgroundUrl ?? null,
      honorRemark: entity.honorRemark ?? null,
      studySchool: entity.graduationSchool ?? null,
      studyCountry: entity.studyArea ?? null,
      companyRemark: entity.companyRemark ?? null,
      jobRemark: entity.jobRemark ?? null,
      socialPost: entity.socialPostRemark ?? null,
    };
  }

  private async getNextMemberStyleId() {
    const latest = await this.memberStyleRepo
      .createQueryBuilder('member')
      .orderBy('member.id', 'DESC')
      .getOne();

    return latest ? Number(latest.id) + 1 : 1;
  }
}
