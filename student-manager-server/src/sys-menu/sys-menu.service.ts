import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSysMenuDto } from './dto/create-sys-menu.dto';
import { UpdateSysMenuDto } from './dto/update-sys-menu.dto';
import { QuerySysMenuDto } from './dto/query-sys-menu.dto';
import { SysMenu } from './entities/sys-menu.entity';
import { FilterBuilder } from '../common/query/filter-builder';

@Injectable()
export class SysMenuService {
  constructor(
    @InjectRepository(SysMenu)
    private readonly sysMenuRepo: Repository<SysMenu>,
  ) {}

  async create(createSysMenuDto: CreateSysMenuDto) {
    // 检查菜单编码是否已存在
    const existingMenu = await this.sysMenuRepo.findOne({
      where: { code: createSysMenuDto.code }
    });
  
    if (existingMenu) {
      throw new ConflictException(`菜单编码 ${createSysMenuDto.code} 已存在`);
    }
  
    // 处理 parentId：undefined 转为 null（顶级菜单）
    const parentId = createSysMenuDto.parentId ?? null;
  
    // 如果有父菜单，验证父菜单是否存在
    if (parentId !== null && parentId > 0) {
      const parentMenu = await this.sysMenuRepo.findOne({
        where: { id: parentId }
      });
      if (!parentMenu) {
        throw new NotFoundException('父菜单不存在');
      }
    }
  
    const menu = this.sysMenuRepo.create({
      ...createSysMenuDto,
      parentId, // 使用处理后的 parentId（可能是 null）
      createTime: new Date(),
      updateTime: new Date(),
      createBy: 'system',
      updateBy: 'system'
    });
  
    return await this.sysMenuRepo.save(menu);
  }

  /**
   * 分页查询菜单列表
   */
  findAll(page: number, limit: number, querySysMenu: QuerySysMenuDto) {
    const queryBuilder = this.sysMenuRepo.createQueryBuilder('sys_menu');

    return new FilterBuilder<SysMenu>(queryBuilder, 'sys_menu')
      .like('name', querySysMenu.name)
      .like('code', querySysMenu.code)
      .eq('type', querySysMenu.type)
      .eq('status', querySysMenu.status)
      .addOrderBy('sort_number', 'ASC')
      .addOrderBy('id', 'ASC')
      .paginate({ page, limit });
  }

  /**
   * 获取所有菜单（不分页，用于树形结构）
   */
  async findAllList() {
    return await this.sysMenuRepo.find({
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 获取启用的菜单
   */
  async findActiveList() {
    return await this.sysMenuRepo.find({
      where: { status: 0 },
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 根据类型获取菜单
   */
  async findByType(type: number) {
    return await this.sysMenuRepo.find({
      where: { type },
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const menu = await this.sysMenuRepo.findOne({ where: { id } });
    
    if (!menu) {
      throw new NotFoundException(`菜单 ID ${id} 不存在`);
    }
    
    return menu;
  }

  async update(id: number, updateSysMenuDto: UpdateSysMenuDto) {
    const menu = await this.findOne(id);

    // 检查菜单编码是否与其他菜单重复
    if (updateSysMenuDto.code && updateSysMenuDto.code !== menu.code) {
      const existingMenu = await this.sysMenuRepo.findOne({
        where: { code: updateSysMenuDto.code }
      });

      if (existingMenu) {
        throw new ConflictException(`菜单编码 ${updateSysMenuDto.code} 已存在`);
      }
    }

    // 验证父菜单
    if (updateSysMenuDto.parentId !== undefined) {
      // 不能将自己设为父菜单
      if (updateSysMenuDto.parentId === id) {
        throw new BadRequestException('不能将自己设为父菜单');
      }

      // 验证父菜单是否存在
      if (updateSysMenuDto.parentId > 0) {
        const parentMenu = await this.sysMenuRepo.findOne({
          where: { id: updateSysMenuDto.parentId }
        });
        if (!parentMenu) {
          throw new NotFoundException('父菜单不存在');
        }

        // 检查是否会造成循环引用
        const isCircular = await this.checkCircularReference(id, updateSysMenuDto.parentId);
        if (isCircular) {
          throw new BadRequestException('不能设置为子菜单的父菜单（会造成循环引用）');
        }
      }
    }

    Object.assign(menu, {
      ...updateSysMenuDto,
      updateTime: new Date(),
      updateBy: 'system'
    });

    return await this.sysMenuRepo.save(menu);
  }

  async remove(id: number) {
    const menu = await this.findOne(id);

    // 检查是否有子菜单
    const children = await this.sysMenuRepo.find({
      where: { parentId: id }
    });

    if (children.length > 0) {
      throw new BadRequestException('该菜单下有子菜单，不能删除');
    }

    await this.sysMenuRepo.remove(menu);
    return { message: `菜单 ${menu.name} 已删除`, id };
  }

  /**
   * 获取菜单树
   */
  async getMenuTree() {
    const menus = await this.sysMenuRepo.find({
      order: { sortNumber: 'ASC', id: 'ASC' }
    });

    return this.buildTree(menus, 0);
  }

  /**
   * 更新菜单状态
   */
  async updateStatus(id: number, status: number) {
    const menu = await this.findOne(id);
    
    menu.status = status;
    menu.updateTime = new Date();
    menu.updateBy = 'system';
    
    return await this.sysMenuRepo.save(menu);
  }

  /**
   * 构建菜单树
   */
  private buildTree(menus: SysMenu[], parentId: number | null = null): any[] {
    const tree = [];
    
    for (const menu of menus) {
      if (menu.parentId === parentId) {
        const children = this.buildTree(menus, menu.id);
        const node: any = { ...menu };
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
  private async checkCircularReference(currentId: number, targetParentId: number): Promise<boolean> {
    let parentId = targetParentId;

    while (parentId !== 0) {
      if (parentId === currentId) {
        return true;
      }

      const parent = await this.sysMenuRepo.findOne({
        where: { id: parentId }
      });

      if (!parent) {
        break;
      }

      parentId = parent.parentId;
    }

    return false;
  }
}
