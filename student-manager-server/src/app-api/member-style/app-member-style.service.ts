import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LxMemberStyle } from '../../student-business/entities/lx-member-style.entity';
import { LxMemberAward } from '../../student-business/entities/lx-member-award.entity';
import { LxMemberStyleAward } from '../../student-business/entities/lx-member-style-award.entity';
import { LxMemberStyleDepartment } from '../../student-business/entities/lx-member-style-department.entity';
import { LxMemberStylePost } from '../../student-business/entities/lx-member-style-post.entity';
import { SysDepartment } from '../../sys-department/entities/sys-department.entity';
import { SysPost } from '../../sys-post/entities/sys-post.entity';

type MemberStyleQuery = {
  pageNum?: string | number;
  pageSize?: string | number;
  keyword?: string;
  postId?: string | number;
  deptId?: string | number;
  awardId?: string | number;
};

@Injectable()
export class AppMemberStyleService {
  constructor(
    @InjectRepository(LxMemberStyle)
    private readonly memberStyleRepo: Repository<LxMemberStyle>,
    @InjectRepository(LxMemberAward)
    private readonly awardRepo: Repository<LxMemberAward>,
    @InjectRepository(LxMemberStyleAward)
    private readonly memberAwardRepo: Repository<LxMemberStyleAward>,
    @InjectRepository(LxMemberStyleDepartment)
    private readonly memberDepartmentRepo: Repository<LxMemberStyleDepartment>,
    @InjectRepository(LxMemberStylePost)
    private readonly memberPostRepo: Repository<LxMemberStylePost>,
    @InjectRepository(SysDepartment)
    private readonly departmentRepo: Repository<SysDepartment>,
    @InjectRepository(SysPost)
    private readonly postRepo: Repository<SysPost>,
  ) {}

  async list(query: MemberStyleQuery) {
    const { pageNum, pageSize } = this.getPage(query);
    const keyword = this.cleanString(query.keyword);
    const postId = this.cleanNumber(query.postId);
    const deptId = this.cleanNumber(query.deptId);
    const awardId = this.cleanNumber(query.awardId);
    const qb = this.memberStyleRepo.createQueryBuilder('member')
      .where('member.status = :status', { status: 0 });

    if (keyword) {
      qb.andWhere(
        '(member.userName LIKE :keyword OR member.displayName LIKE :keyword OR member.jobTitle LIKE :keyword OR member.memberRank LIKE :keyword OR member.graduationSchool LIKE :keyword OR member.studyArea LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (postId > 0) {
      qb.andWhere(
        '(member.postId = :postId OR EXISTS (SELECT 1 FROM lx_member_style_post memberPost WHERE memberPost.member_style_id = member.id AND memberPost.post_id = :postId))',
        { postId },
      );
    }

    if (deptId > 0) {
      qb.andWhere(
        '(member.deptId = :deptId OR EXISTS (SELECT 1 FROM lx_member_style_department memberDepartment WHERE memberDepartment.member_style_id = member.id AND memberDepartment.department_id = :deptId))',
        { deptId },
      );
    }

    if (awardId > 0) {
      qb.innerJoin('lx_member_style_award', 'memberAward', 'memberAward.member_style_id = member.id AND memberAward.award_id = :awardId', { awardId });
    }

    qb.orderBy('member.sortNumber', 'ASC')
      .addOrderBy('member.orderNumber', 'ASC')
      .addOrderBy('member.id', 'ASC');

    const [rows, total] = await qb.skip((pageNum - 1) * pageSize).take(pageSize).getManyAndCount();
    const orgMaps = await this.getOrgMaps(rows);

    return {
      list: rows.map((item) => this.mapMember(item, orgMaps)),
      total,
      pageNum,
      pageSize,
      hasMore: pageNum * pageSize < total,
    };
  }

  async detail(id: number) {
    const item = await this.memberStyleRepo.findOne({ where: { id } });
    if (!item || item.status !== 0) throw new NotFoundException('成员不存在');

    const orgMaps = await this.getOrgMaps([item]);
    return this.mapMember(item, orgMaps);
  }

  async listPosts() {
    const rows = await this.postRepo.find({
      where: { status: 0 },
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
    return rows.map((item) => ({ id: item.id, name: item.name, postName: item.name }));
  }

  async listDepartments() {
    const rows = await this.departmentRepo.find({
      where: { status: 0 },
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
    return rows.map((item) => ({ id: item.id, name: item.name, deptName: item.name, parentId: item.parentId }));
  }

  async listAwards() {
    const rows = await this.awardRepo.find({
      where: { status: 0 },
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
    return rows.map((item) => ({ id: item.id, name: item.name, awardName: item.name }));
  }

  private getPage(query: MemberStyleQuery) {
    const pageNum = Math.max(this.cleanNumber(query.pageNum) || 1, 1);
    const pageSize = Math.min(Math.max(this.cleanNumber(query.pageSize) || 10, 1), 50);
    return { pageNum, pageSize };
  }

  private cleanString(value?: string | number) {
    if (value === undefined || value === null) return '';
    const text = String(value).trim();
    if (!text || text === 'undefined' || text === 'null') return '';
    return text;
  }

  private cleanNumber(value?: string | number) {
    const text = this.cleanString(value);
    if (!text) return 0;
    const numberValue = Number(text);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  private async getOrgMaps(rows: LxMemberStyle[]) {
    const memberIds = rows.map((item) => Number(item.id)).filter(Boolean);
    if (!memberIds.length) {
      return {
        postMap: new Map<number, SysPost>(),
        deptMap: new Map<number, SysDepartment>(),
        awardMap: new Map<number, LxMemberAward>(),
        memberPosts: new Map<number, number[]>(),
        memberDepartments: new Map<number, number[]>(),
        memberAwards: new Map<number, number[]>(),
      };
    }

    const [postRels, deptRels, awardRels] = await Promise.all([
      this.queryMemberRelations('lx_member_style_post', 'post_id', memberIds),
      this.queryMemberRelations('lx_member_style_department', 'department_id', memberIds),
      this.queryMemberRelations('lx_member_style_award', 'award_id', memberIds),
    ]);
    const postIds = Array.from(new Set([
      ...postRels.map((item) => Number(item.valueId)),
      ...rows.map((item) => Number(item.postId)),
    ].filter(Boolean)));
    const deptIds = Array.from(new Set([
      ...deptRels.map((item) => Number(item.valueId)),
      ...rows.map((item) => Number(item.deptId)),
    ].filter(Boolean)));
    const awardIds = Array.from(new Set(awardRels.map((item) => Number(item.valueId)).filter(Boolean)));
    const [posts, depts, awards] = await Promise.all([
      postIds.length ? this.postRepo.find({ where: { id: In(postIds) } }) : [],
      deptIds.length ? this.departmentRepo.find({ where: { id: In(deptIds) } }) : [],
      awardIds.length ? this.awardRepo.find({ where: { id: In(awardIds) } }) : [],
    ]);
    return {
      postMap: new Map<number, SysPost>(posts.map((item) => [Number(item.id), item] as [number, SysPost])),
      deptMap: new Map<number, SysDepartment>(depts.map((item) => [Number(item.id), item] as [number, SysDepartment])),
      awardMap: new Map<number, LxMemberAward>(awards.map((item) => [Number(item.id), item] as [number, LxMemberAward])),
      memberPosts: this.groupRawRelationIds(postRels),
      memberDepartments: this.groupRawRelationIds(deptRels),
      memberAwards: this.groupRawRelationIds(awardRels),
    };
  }

  private async queryMemberRelations(
    tableName: string,
    valueColumn: string,
    memberIds: number[],
  ): Promise<Array<{ memberStyleId: number; valueId: number }>> {
    if (!memberIds.length) return [];
    const placeholders = memberIds.map(() => '?').join(',');
    const rows = await this.memberStyleRepo.manager.query(
      `SELECT member_style_id, ${valueColumn} AS value_id FROM ${tableName} WHERE member_style_id IN (${placeholders})`,
      memberIds,
    );

    return rows.map((row: Record<string, string | number>) => ({
      memberStyleId: Number(row.member_style_id ?? row.memberStyleId),
      valueId: Number(row.value_id ?? row.valueId),
    }));
  }

  private groupRawRelationIds(rows: Array<{ memberStyleId: number; valueId: number }>) {
    const result = new Map<number, number[]>();
    rows.forEach((row) => {
      const ownerId = Number(row.memberStyleId);
      const valueId = Number(row.valueId);
      if (!ownerId || !valueId) return;
      const list = result.get(ownerId) || [];
      list.push(valueId);
      result.set(ownerId, list);
    });
    return result;
  }

  private mapMember(item: LxMemberStyle, orgMaps: Awaited<ReturnType<AppMemberStyleService['getOrgMaps']>>) {
    const memberId = Number(item.id);
    const postIds = orgMaps.memberPosts.get(memberId) || (item.postId ? [Number(item.postId)] : []);
    const deptIds = orgMaps.memberDepartments.get(memberId) || (item.deptId ? [Number(item.deptId)] : []);
    const awardIds = orgMaps.memberAwards.get(memberId) || [];
    const posts = postIds.map((id) => orgMaps.postMap.get(id)).filter(Boolean) as SysPost[];
    const depts = deptIds.map((id) => orgMaps.deptMap.get(id)).filter(Boolean) as SysDepartment[];
    const awards = awardIds.map((id) => orgMaps.awardMap.get(id)).filter(Boolean) as LxMemberAward[];
    const post = posts[0];
    const dept = depts.find((item) => Number(item.id) !== 100) || depts[0];
    return {
      id: item.id,
      name: item.userName,
      displayName: item.displayName,
      avatarUrl: item.avatarUrl,
      backgroundUrl: item.backgroundUrl,
      postId: post?.id || item.postId,
      postName: post?.name || item.jobTitle,
      posts: posts.map((item) => ({ id: item.id, name: item.name, postName: item.name })),
      deptId: dept?.id || item.deptId,
      deptName: dept?.name || item.memberRank,
      departments: depts.map((item) => ({ id: item.id, name: item.name, deptName: item.name, parentId: item.parentId })),
      awards: awards.map((item) => ({ id: item.id, name: item.name, awardName: item.name })),
      awardNames: awards.map((item) => item.name),
      jobTitle: item.jobTitle,
      memberRank: item.memberRank,
      company: item.companyRemark,
      introduce: item.honorRemark,
      honorRemark: item.honorRemark,
      studySchool: item.graduationSchool,
      studyCountry: item.studyArea,
      jobRemark: item.jobRemark,
      socialPost: item.socialPostRemark,
    };
  }
}
