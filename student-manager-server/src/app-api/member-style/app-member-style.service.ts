import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LxMemberStyle } from '../../student-business/entities/lx-member-style.entity';
import { SysDepartment } from '../../sys-department/entities/sys-department.entity';
import { SysPost } from '../../sys-post/entities/sys-post.entity';

type MemberStyleQuery = {
  pageNum?: string | number;
  pageSize?: string | number;
  keyword?: string;
  postId?: string | number;
  deptId?: string | number;
};

@Injectable()
export class AppMemberStyleService {
  constructor(
    @InjectRepository(LxMemberStyle)
    private readonly memberStyleRepo: Repository<LxMemberStyle>,
    @InjectRepository(SysDepartment)
    private readonly departmentRepo: Repository<SysDepartment>,
    @InjectRepository(SysPost)
    private readonly postRepo: Repository<SysPost>,
  ) {}

  async list(query: MemberStyleQuery) {
    const { pageNum, pageSize } = this.getPage(query);
    const qb = this.memberStyleRepo.createQueryBuilder('member')
      .where('member.status = :status', { status: 0 });

    if (query.keyword) {
      qb.andWhere(
        '(member.userName LIKE :keyword OR member.displayName LIKE :keyword OR member.jobTitle LIKE :keyword OR member.memberRank LIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      );
    }

    const postId = Number(query.postId || 0);
    if (postId > 0) {
      qb.andWhere('member.postId = :postId', { postId });
    }

    const deptId = Number(query.deptId || 0);
    if (deptId > 0) {
      qb.andWhere('member.deptId = :deptId', { deptId });
    }

    qb.orderBy('member.sortNumber', 'ASC')
      .addOrderBy('member.orderNumber', 'ASC')
      .addOrderBy('member.id', 'ASC');

    const [rows, total] = await qb.skip((pageNum - 1) * pageSize).take(pageSize).getManyAndCount();
    const { postMap, deptMap } = await this.getOrgMaps(rows);

    return {
      list: rows.map((item) => this.mapMember(item, postMap, deptMap)),
      total,
      pageNum,
      pageSize,
      hasMore: pageNum * pageSize < total,
    };
  }

  async detail(id: number) {
    const item = await this.memberStyleRepo.findOne({ where: { id } });
    if (!item || item.status !== 0) throw new NotFoundException('成员不存在');

    const { postMap, deptMap } = await this.getOrgMaps([item]);
    return this.mapMember(item, postMap, deptMap);
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

  private getPage(query: MemberStyleQuery) {
    const pageNum = Math.max(Number(query.pageNum || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || 10), 1), 50);
    return { pageNum, pageSize };
  }

  private async getOrgMaps(rows: LxMemberStyle[]) {
    const postIds = Array.from(new Set(rows.map((item) => Number(item.postId || 0)).filter(Boolean)));
    const deptIds = Array.from(new Set(rows.map((item) => Number(item.deptId || 0)).filter(Boolean)));
    const [posts, depts] = await Promise.all([
      postIds.length ? this.postRepo.findByIds(postIds) : [],
      deptIds.length ? this.departmentRepo.findByIds(deptIds) : [],
    ]);
    return {
      postMap: new Map<number, SysPost>(posts.map((item) => [item.id, item] as [number, SysPost])),
      deptMap: new Map<number, SysDepartment>(depts.map((item) => [item.id, item] as [number, SysDepartment])),
    };
  }

  private mapMember(
    item: LxMemberStyle,
    postMap: Map<number, SysPost>,
    deptMap: Map<number, SysDepartment>,
  ) {
    const post = item.postId ? postMap.get(Number(item.postId)) : undefined;
    const dept = item.deptId ? deptMap.get(Number(item.deptId)) : undefined;
    return {
      id: item.id,
      name: item.userName,
      displayName: item.displayName,
      avatarUrl: item.avatarUrl,
      backgroundUrl: item.backgroundUrl,
      postId: item.postId,
      postName: post?.name || item.jobTitle,
      deptId: item.deptId,
      deptName: dept?.name || item.memberRank,
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
