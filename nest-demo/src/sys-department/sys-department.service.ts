import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSysDepartmentDto } from './dto/create-sys-department.dto';
import { UpdateSysDepartmentDto } from './dto/update-sys-department.dto';
import { SysDepartment } from './entities/sys-department.entity';
import { QuerySysDepartmentDto } from './dto/query-sys-department.dto';
import { FilterBuilder } from '../common/query/filter-builder';

@Injectable()
export class SysDepartmentService {
  constructor(
    @InjectRepository(SysDepartment)
    private readonly departmentRepository: Repository<SysDepartment>,
  ) {}

  /**
   * 创建部门
   */
  async create(createSysDepartmentDto: CreateSysDepartmentDto) {
    // 检查部门编码是否已存在
    const existingDept = await this.departmentRepository.findOne({
      where: { code: createSysDepartmentDto.code },
    });

    if (existingDept) {
      throw new BadRequestException('部门编码已存在');
    }

    // 如果有父部门，验证父部门是否存在
    if (createSysDepartmentDto.parentId && createSysDepartmentDto.parentId > 0) {
      const parentDept = await this.departmentRepository.findOne({
        where: { id: createSysDepartmentDto.parentId },
      });
      if (!parentDept) {
        throw new NotFoundException('父部门不存在');
      }
    }

    const department = this.departmentRepository.create({
      ...createSysDepartmentDto,
      createTime: new Date(),
      updateTime: new Date(),
    });

    return await this.departmentRepository.save(department);
  }

  /**
   * 查询所有部门（树形结构）
   */
  async findAllTree() {
    const departments = await this.departmentRepository.find({
      order: { sortNumber: 'ASC', id: 'ASC' },
    });

    // 构建树形结构
    return this.buildTree(departments, 0);
  }

  findAll(page: number, limit: number, querySysDepartment: QuerySysDepartmentDto) {
    const queryBuilder = this.departmentRepository.createQueryBuilder('sys_department');

    return new FilterBuilder<SysDepartment>(queryBuilder, 'sys_department')
      .like('name', querySysDepartment.name)
      .like('code', querySysDepartment.code)
      .like('leader', querySysDepartment.leader)
      .eq('status', querySysDepartment.status)
      .addOrderBy('sort_number', 'ASC')
      .addOrderBy('id', 'ASC')
      .paginate({ page, limit });
  }

  /**
   * 查询所有部门（列表）
   */
  async findAllList() {
    return await this.departmentRepository.find({
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 根据ID查询部门
   */
  async findOne(id: number) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`部门 ID ${id} 不存在`);
    }

    return department;
  }

  /**
   * 更新部门
   */
  async update(id: number, updateSysDepartmentDto: UpdateSysDepartmentDto) {
    const department = await this.findOne(id);

    // 如果要更新编码，检查是否与其他部门重复
    if (updateSysDepartmentDto.code && updateSysDepartmentDto.code !== department.code) {
      const existingDept = await this.departmentRepository.findOne({
        where: { code: updateSysDepartmentDto.code },
      });
      if (existingDept) {
        throw new BadRequestException('部门编码已存在');
      }
    }

    // 如果要更新父部门，验证
    if (updateSysDepartmentDto.parentId !== undefined) {
      // 不能将自己设为父部门
      if (updateSysDepartmentDto.parentId === id) {
        throw new BadRequestException('不能将自己设为父部门');
      }

      // 验证父部门是否存在
      if (updateSysDepartmentDto.parentId > 0) {
        const parentDept = await this.departmentRepository.findOne({
          where: { id: updateSysDepartmentDto.parentId },
        });
        if (!parentDept) {
          throw new NotFoundException('父部门不存在');
        }

        // 检查是否会造成循环引用
        const isCircular = await this.checkCircularReference(
          id,
          updateSysDepartmentDto.parentId,
        );
        if (isCircular) {
          throw new BadRequestException('不能设置为子部门的父部门（会造成循环引用）');
        }
      }
    }

    Object.assign(department, updateSysDepartmentDto, {
      updateTime: new Date(),
    });

    return await this.departmentRepository.save(department);
  }

  /**
   * 删除部门
   */
  async remove(id: number) {
    const department = await this.findOne(id);

    // 检查是否有子部门
    const children = await this.departmentRepository.find({
      where: { parentId: id },
    });

    if (children.length > 0) {
      throw new BadRequestException('该部门下有子部门，不能删除');
    }

    // TODO: 检查是否有用户关联该部门
    // const hasUsers = await this.checkDepartmentUsers(id);
    // if (hasUsers) {
    //   throw new BadRequestException('该部门下有用户，不能删除');
    // }

    await this.departmentRepository.remove(department);
    return { message: '删除成功' };
  }

  /**
   * 构建树形结构
   */
  private buildTree(departments: SysDepartment[], parentId: number = 0): any[] {
    const tree = [];
    
    for (const dept of departments) {
      if (dept.parentId === parentId) {
        const children = this.buildTree(departments, dept.id);
        const node: any = { ...dept };
        if (children.length > 0) {
          node.children = children;
        }
        tree.push(node);
      }
    }
    
    return tree;
  }



  /**
   * 检查是否存在循环引用
   */
  private async checkCircularReference(
    currentId: number,
    targetParentId: number,
  ): Promise<boolean> {
    let parentId = targetParentId;

    while (parentId !== 0) {
      if (parentId === currentId) {
        return true; // 存在循环引用
      }

      const parent = await this.departmentRepository.findOne({
        where: { id: parentId },
      });

      if (!parent) {
        break;
      }

      parentId = parent.parentId;
    }

    return false;
  }
}
