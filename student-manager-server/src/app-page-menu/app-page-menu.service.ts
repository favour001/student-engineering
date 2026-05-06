import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppPageMenu } from './entities/app-page-menu.entity';

type AppPageMenuQuery = {
  name?: string;
  status?: string | number;
  page?: string | number;
  limit?: string | number;
};

@Injectable()
export class AppPageMenuService {
  constructor(
    @InjectRepository(AppPageMenu)
    private readonly repo: Repository<AppPageMenu>,
  ) {}

  async findAll(query: AppPageMenuQuery) {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
    const qb = this.repo.createQueryBuilder('menu');

    if (query.name) {
      qb.andWhere('menu.name LIKE :name', { name: `%${query.name}%` });
    }
    if (query.status !== undefined && query.status !== '') {
      qb.andWhere('menu.status = :status', { status: Number(query.status) });
    }

    qb.orderBy('menu.sortNumber', 'ASC').addOrderBy('menu.id', 'ASC');
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findActiveList() {
    return this.repo.find({
      where: { status: 0 },
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
  }

  async create(body: Partial<AppPageMenu>) {
    this.validate(body);
    return this.repo.save(
      this.repo.create({
        name: body.name,
        path: this.normalizePath(body.path),
        icon: body.icon || null,
        sortNumber: Number(body.sortNumber || 0),
        status: Number(body.status || 0),
        remark: body.remark || null,
      }),
    );
  }

  async update(id: number, body: Partial<AppPageMenu>) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('小程序菜单不存在');

    Object.assign(entity, {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.path !== undefined ? { path: this.normalizePath(body.path) } : {}),
      ...(body.icon !== undefined ? { icon: body.icon || null } : {}),
      ...(body.sortNumber !== undefined ? { sortNumber: Number(body.sortNumber || 0) } : {}),
      ...(body.status !== undefined ? { status: Number(body.status || 0) } : {}),
      ...(body.remark !== undefined ? { remark: body.remark || null } : {}),
    });
    this.validate(entity);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('小程序菜单不存在');
    await this.repo.remove(entity);
    return { message: '删除成功', id };
  }

  private validate(body: Partial<AppPageMenu>) {
    if (!body.name) throw new BadRequestException('请填写页面名称');
    if (!body.path) throw new BadRequestException('请填写小程序页面路径');
  }

  private normalizePath(path?: string | null) {
    const value = `${path || ''}`.trim();
    if (!value) return value;
    return value.startsWith('/') ? value : `/${value}`;
  }
}
