import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateSysPermissionDto } from './dto/create-sys-permission.dto';
import { UpdateSysPermissionDto } from './dto/update-sys-permission.dto';
import { SysUser } from '../sys-user/entities/sys-user.entity';
import { SysRole } from '../sys-role/entities/sys-role.entity';
import { SysMenu } from '../sys-menu/entities/sys-menu.entity';

export interface MenuTree extends SysMenu {
  children?: MenuTree[];
}

@Injectable()
export class SysPermissionService {
  constructor(
    @InjectRepository(SysUser)
    private readonly userRepo: Repository<SysUser>,
    @InjectRepository(SysRole)
    private readonly roleRepo: Repository<SysRole>,
    @InjectRepository(SysMenu)
    private readonly menuRepo: Repository<SysMenu>,
  ) {}

  /**
   * 获取用户的所有权限标识
   */
  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.menus'],
    });

    if (!user) {
      return [];
    }

    // 收集所有角色的菜单权限
    const permissions = new Set<string>();
    
    user.roles.forEach((role) => {
      if (this.isEnabledStatus(role.status)) {
        role.menus.forEach((menu) => {
          if (this.isEnabledStatus(menu.status) && menu.permission) {
            permissions.add(menu.permission);
          }
        });
      }
    });

    return Array.from(permissions);
  }

  /**
   * 获取用户的菜单权限（扁平化结构，用于前端菜单显示）
   */
  async getUserMenuTree(userId: number): Promise<SysMenu[]> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.menus'],
    });

    if (!user) {
      return [];
    }

    // 收集所有菜单权限
    const menuMap = new Map<number, SysMenu>();
    
    user.roles.forEach((role) => {
      if (this.isEnabledStatus(role.status)) {
        role.menus.forEach((menu) => {
          if (this.isEnabledStatus(menu.status) && menu.type !== 3) {
            menuMap.set(menu.id, menu);
          }
        });
      }
    });

    // 返回扁平化结构
    return Array.from(menuMap.values());
  }

  /**
   * 获取用户的按钮权限
   */
  async getUserButtonPermissions(userId: number): Promise<string[]> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.menus']
    });

    if (!user) {
      return [];
    }

    const permissions = new Set<string>();
    
    user.roles.forEach((role) => {
      if (this.isEnabledStatus(role.status)) {
        role.menus.forEach((menu) => {
          if (
            this.isEnabledStatus(menu.status) &&
            menu.type === 3 &&
            menu.permission
          ) {
            permissions.add(menu.permission);
          }
        });
      }
    });

    return Array.from(permissions);
  }

  /**
   * 为角色分配菜单权限
   */
  async assignMenusToRole(roleId: number, menuIds: number[]): Promise<void> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['menus'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const uniqueMenuIds = [...new Set(menuIds)];
    if (uniqueMenuIds.length === 0) {
      role.menus = [];
      await this.roleRepo.save(role);
      return;
    }

    const menus = await this.menuRepo.findBy({ id: In(uniqueMenuIds) });
    if (menus.length !== uniqueMenuIds.length) {
      throw new BadRequestException('部分菜单不存在，无法分配权限');
    }

    role.menus = menus;
    await this.roleRepo.save(role);
  }

  /**
   * 获取角色的菜单权限
   */
  async getRoleMenusByRoleId(roleId: number): Promise<SysMenu[]> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['menus']
    });

    return role ? role.menus : [];
  }

  /**
   * 获取所有菜单权限（树形结构）
   */
  async getAllMenuTree(): Promise<MenuTree[]> {
    const menus = await this.menuRepo.find({
      order: { sortNumber: 'ASC' },
    });

    return this.buildMenuTree(
      menus.filter((menu) => this.isEnabledStatus(menu.status)),
    );
  }

  /**
   * 构建菜单树
   */
  private buildMenuTree(menus: SysMenu[]): MenuTree[] {
    const menuMap = new Map<number, MenuTree>();
    const rootMenus: MenuTree[] = [];

    // 先将所有菜单放入 Map
    menus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // 构建树形结构
    menus.forEach(menu => {
      const current = menuMap.get(menu.id);
      if (menu.parentId === 0 || menu.parentId === null) {
        rootMenus.push(current);
      } else {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(current);
        }
      }
    });

    // 排序
    this.sortMenuTree(rootMenus);
    return rootMenus;
  }

  /**
   * 菜单树排序
   */
  private sortMenuTree(menus: MenuTree[]): void {
    menus.sort((a, b) => a.sortNumber - b.sortNumber);
    menus.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        this.sortMenuTree(menu.children);
      }
    });
  }

  /**
   * 检查用户是否有指定权限
   */
  async hasPermission(userId: number, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.includes(permission);
  }

  /**
   * 检查用户是否有任意一个权限
   */
  async hasAnyPermission(userId: number, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * 检查用户是否有所有指定权限
   */
  async hasAllPermissions(userId: number, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * 获取用户的所有角色
   */
  async getUserRoles(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    return user
      ? user.roles.filter((role) => this.isEnabledStatus(role.status))
      : [];
  }

  // Legacy data currently stores enabled states as both 0 and 1 across modules.
  private isEnabledStatus(status: number | null | undefined): boolean {
    return status === 0 || status === 1;
  }
}
