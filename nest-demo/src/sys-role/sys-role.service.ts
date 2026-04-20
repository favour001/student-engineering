import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSysRoleDto } from './dto/create-sys-role.dto';
import { UpdateSysRoleDto } from './dto/update-sys-role.dto';
import { QuerySysRoleDto } from './dto/query-sys-role.dto';
import { SysRole } from './entities/sys-role.entity';
import { SysUser } from '../sys-user/entities/sys-user.entity';
import { FilterBuilder } from '../common/query/filter-builder';

@Injectable()
export class SysRoleService {
  constructor(
    @InjectRepository(SysRole)
    private readonly sysRoleRepo: Repository<SysRole>,
    @InjectRepository(SysUser)
    private readonly userRepo: Repository<SysUser>,
  ) {}

  /**
   * 创建角色
   */
  async create(createSysRoleDto: CreateSysRoleDto) {
    // 检查角色编码是否已存在
    const existingRole = await this.sysRoleRepo.findOne({
      where: { code: createSysRoleDto.code },
    });

    if (existingRole) {
      throw new BadRequestException('角色编码已存在');
    }

    const role = this.sysRoleRepo.create({
      ...createSysRoleDto,
      createTime: new Date(),
      updateTime: new Date(),
    });

    return await this.sysRoleRepo.save(role);
  }

  /**
   * 分页查询角色列表
   */
  findAll(page: number, limit: number, querySysRole: QuerySysRoleDto) {
    const queryBuilder = this.sysRoleRepo.createQueryBuilder('sys_role');

    return new FilterBuilder<SysRole>(queryBuilder, 'sys_role')
      .like('name', querySysRole.name)
      .like('code', querySysRole.code)
      .eq('status', querySysRole.status)
      .addOrderBy('sort_number', 'ASC')
      .addOrderBy('id', 'ASC')
      .paginate({ page, limit });
  }

  /**
   * 获取所有角色（不分页）
   */
  async findAllList() {
    return await this.sysRoleRepo.find({
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 获取启用的角色
   */
  async findActiveList() {
    return await this.sysRoleRepo.find({
      where: { status: 0 },
      order: { sortNumber: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 根据ID查询角色
   */
  async findOne(id: number) {
    const role = await this.sysRoleRepo.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    return role;
  }

  /**
   * 根据ID查询角色（包含菜单）
   */
  async findOneWithMenus(id: number) {
    const role = await this.sysRoleRepo.findOne({
      where: { id },
      relations: ['menus'],
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    return role;
  }

  /**
   * 更新角色
   */
  async update(id: number, updateSysRoleDto: UpdateSysRoleDto) {
    const role = await this.sysRoleRepo.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    // 如果要更新编码，检查是否与其他角色重复
    if (updateSysRoleDto.code && updateSysRoleDto.code !== role.code) {
      const existingRole = await this.sysRoleRepo.findOne({
        where: { code: updateSysRoleDto.code },
      });
      if (existingRole) {
        throw new BadRequestException('角色编码已存在');
      }
    }

    Object.assign(role, updateSysRoleDto, {
      updateTime: new Date(),
    });

    return await this.sysRoleRepo.save(role);
  }

  /**
   * 删除角色
   */
  async remove(id: number) {
    const role = await this.sysRoleRepo.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    // 检查是否有用户关联该角色
    const hasUsers = await this.checkRoleUsers(id);
    if (hasUsers) {
      const userCount = await this.getRoleUserCount(id);
      throw new BadRequestException(`该角色下有 ${userCount} 个用户，不能删除`);
    }

    await this.sysRoleRepo.remove(role);
    return { message: '删除成功' };
  }

  /**
   * 更新角色状态
   */
  async updateStatus(id: number, status: number) {
    const role = await this.sysRoleRepo.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    role.status = status;
    role.updateTime = new Date();

    return await this.sysRoleRepo.save(role);
  }

  // ========== 用户关系相关方法 ==========

  /**
   * 检查角色下是否有用户
   */
  private async checkRoleUsers(roleId: number): Promise<boolean> {
    const count = await this.getRoleUserCount(roleId);
    return count > 0;
  }

  /**
   * 获取角色下的用户数量（通过中间表查询）
   */
  async getRoleUserCount(roleId: number): Promise<number> {
    const count = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('sys_user_role', 'ur', 'ur.user_id = user.id')
      .where('ur.role_id = :roleId', { roleId })
      .getCount();
    
    return count;
  }

  /**
   * 获取角色下的所有用户
   */
  async getRoleUsers(roleId: number) {
    // 先验证角色是否存在
    await this.findOne(roleId);

    // 通过中间表查询用户
    const users = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('sys_user_role', 'ur', 'ur.user_id = user.id')
      .where('ur.role_id = :roleId', { roleId })
      .select([
        'user.id',
        'user.userName',
        'user.login',
        'user.email',
        'user.phoneNumber',
        'user.status',
      ])
      .getMany();

    return users;
  }

  /**
   * 根据编码查询角色
   */
  async findByCode(code: string) {
    const role = await this.sysRoleRepo.findOne({
      where: { code },
    });

    if (!role) {
      throw new NotFoundException(`角色编码 ${code} 不存在`);
    }

    return role;
  }

  /**
   * 统计角色（按状态）
   */
  async countByStatus() {
    const roles = await this.sysRoleRepo.find();
    const active = roles.filter(r => r.status === 0).length;
    const inactive = roles.filter(r => r.status === 1).length;

    return {
      total: roles.length,
      active,
      inactive,
    };
  }
}
