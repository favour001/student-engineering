import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { SysPost } from '../../sys-post/entities/sys-post.entity';
import { SysDepartment } from '../../sys-department/entities/sys-department.entity';

type PageQuery = Record<string, string | number | undefined>;

@Injectable()
export class AppSystemService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(SysPost) private readonly postRepo: Repository<SysPost>,
    @InjectRepository(SysDepartment) private readonly departmentRepo: Repository<SysDepartment>
  ) {}

  async listPosts() {
    const rows = await this.postRepo.find({ where: { status: 0 }, order: { sortNumber: 'ASC', id: 'ASC' } });
    return rows.map((item) => ({ id: item.id, name: item.name, postName: item.name }));
  }

  async listDepartments() {
    const rows = await this.departmentRepo.find({ where: { status: 0 }, order: { sortNumber: 'ASC', id: 'ASC' } });
    return rows.map((item) => ({ id: item.id, name: item.name, deptName: item.name }));
  }

  
}
