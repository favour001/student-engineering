import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSysPostDto } from './dto/create-sys-post.dto';
import { UpdateSysPostDto } from './dto/update-sys-post.dto';
import { QuerySysPostDto } from './dto/query-sys-post.dto';
import { SysPost } from './entities/sys-post.entity';
import { FilterBuilder } from '../utils/filter-builder';

@Injectable()
export class SysPostService {
  constructor(
    @InjectRepository(SysPost)
    private readonly sysPostRepo: Repository<SysPost>,
  ) {}

  async create(createSysPostDto: CreateSysPostDto) {
    // Check if post code already exists
    const existingPost = await this.sysPostRepo.findOne({
      where: { code: createSysPostDto.code }
    });

    if (existingPost) {
      throw new ConflictException(`岗位编码 ${createSysPostDto.code} 已存在`);
    }

    const sysPost = this.sysPostRepo.create({
      name: createSysPostDto.name,
      code: createSysPostDto.code,
      sortNumber: createSysPostDto.sortNumber || 0,
      status: createSysPostDto.status ?? 0,
      describe: createSysPostDto.describe || '',
      createTime: new Date(),
      updateTime: new Date(),
      createBy: 'system',
      updateBy: 'system'
    });

    return await this.sysPostRepo.save(sysPost);
  }

  findAll(page: number, limit: number, querySysPost: QuerySysPostDto) {
    const queryBuilder = this.sysPostRepo.createQueryBuilder('sys_post');

    return new FilterBuilder<SysPost>(queryBuilder, 'sys_post')
      .like('name', querySysPost.name)
      .like('code', querySysPost.code)
      .eq('status', querySysPost.status)
      .addOrderBy('sort_number', 'ASC')
      .addOrderBy('id', 'ASC')
      .paginate({ page, limit });
  }

  async findAllList() {
    return await this.sysPostRepo.find({
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const post = await this.sysPostRepo.findOne({ where: { id } });
    
    if (!post) {
      throw new NotFoundException(`岗位 ID ${id} 不存在`);
    }
    
    return post;
  }

  async update(id: number, updateSysPostDto: UpdateSysPostDto) {
    const post = await this.findOne(id);

    // Check if updating code and if new code already exists
    if (updateSysPostDto.code && updateSysPostDto.code !== post.code) {
      const existingPost = await this.sysPostRepo.findOne({
        where: { code: updateSysPostDto.code }
      });

      if (existingPost) {
        throw new ConflictException(`岗位编码 ${updateSysPostDto.code} 已存在`);
      }
    }

    // Update fields
    Object.assign(post, {
      ...updateSysPostDto,
      updateTime: new Date(),
      updateBy: 'system'
    });

    return await this.sysPostRepo.save(post);
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    
    // Soft delete by updating status or hard delete
    await this.sysPostRepo.remove(post);
    
    return { message: `岗位 ${post.name} 已删除`, id };
  }

  async batchDelete(ids: number[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('请提供要删除的岗位ID');
    }

    const posts = await this.sysPostRepo.findByIds(ids);
    
    if (posts.length !== ids.length) {
      throw new NotFoundException('部分岗位不存在');
    }

    await this.sysPostRepo.remove(posts);
    
    return { message: `成功删除 ${posts.length} 个岗位`, count: posts.length };
  }

  async updateStatus(id: number, status: number) {
    const post = await this.findOne(id);
    
    post.status = status;
    post.updateTime = new Date();
    post.updateBy = 'system';
    
    return await this.sysPostRepo.save(post);
  }
}