import { Logger } from '@nestjs/common';
import { SysUserService } from '../../src/sys-user/sys-user.service';
import { SysRoleService } from '../../src/sys-role/sys-role.service';
import { SysMenuService } from '../../src/sys-menu/sys-menu.service';
import { DataSource } from 'typeorm';
import { SeedOptions } from '../interfaces/seed-options.interface';
import { StatsTracker } from '../support/stats-tracker';

export class RelationSeeder {
  private readonly logger = new Logger('RelationSeeder');

  constructor(
    private readonly options: SeedOptions,
    private readonly stats: StatsTracker
  ) {}

  async seed(app: any, data: any): Promise<void> {
    if (!data) {
      this.logger.log('⚠️  没有关联关系数据需要处理');
      return;
    }

    this.logger.log('🔗 开始处理关联关系数据...');

    // 处理角色-菜单关联
    if (data.roleMenus && data.roleMenus.length > 0) {
      await this.seedRoleMenus(app, data.roleMenus);
    }

    // 处理用户-角色关联
    if (data.userRoles && data.userRoles.length > 0) {
      await this.seedUserRoles(app, data.userRoles);
    }

    // 处理用户-岗位关联
    if (data.userPosts && data.userPosts.length > 0) {
      await this.seedUserPosts(app, data.userPosts);
    }

    // 处理用户-部门关联
    if (data.userDepartments && data.userDepartments.length > 0) {
      await this.seedUserDepartments(app, data.userDepartments);
    }

    this.logger.log('✅ 关联关系数据处理完成');
  }

  private async seedRoleMenus(app: any, roleMenus: any[]) {
    const roleService = app.get(SysRoleService);
    const menuService = app.get(SysMenuService);
    const dataSource = app.get(DataSource);

    for (const relation of roleMenus) {
      try {
        // 查找角色
        const allRoles = await roleService.findAllList();
        const role = allRoles.find(r => r.code === relation.roleCode);
        
        if (!role) {
          this.logger.warn(`⚠️  角色 ${relation.roleCode} 不存在，跳过`);
          continue;
        }

        // 获取菜单
        let menuIds: number[] = [];
        if (relation.menuCodes === 'all') {
          // 所有菜单
          const allMenus = await menuService.findAllList();
          menuIds = allMenus.map(m => m.id);
        } else if (Array.isArray(relation.menuCodes)) {
          // 指定菜单
          const allMenus = await menuService.findAllList();
          menuIds = allMenus
            .filter(m => relation.menuCodes.includes(m.code))
            .map(m => m.id);
        }

        if (menuIds.length > 0) {
          // 使用原生 SQL 插入关联关系
          for (const menuId of menuIds) {
            await dataSource.query(
              'INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES (?, ?)',
              [role.id, menuId]
            );
          }
          
          this.logger.log(`✅ 角色 ${role.name} 关联了 ${menuIds.length} 个菜单`);
          this.stats.incrementCreated();
        }
      } catch (error) {
        this.logger.error(`❌ 角色-菜单关联失败:`, error.message);
        this.stats.incrementFailed();
      }
    }
  }

  private async seedUserRoles(app: any, userRoles: any[]) {
    const userService = app.get(SysUserService);
    const roleService = app.get(SysRoleService);
    const dataSource = app.get(DataSource);

    for (const relation of userRoles) {
      try {
        // 查找用户
        const user = await userService.findOneByAccount(relation.userAccount);
        
        if (!user) {
          this.logger.warn(`⚠️  用户 ${relation.userAccount} 不存在，跳过`);
          continue;
        }

        // 查找角色
        const allRoles = await roleService.findAllList();
        const roleIds = allRoles
          .filter(r => relation.roleCodes.includes(r.code))
          .map(r => r.id);

        if (roleIds.length > 0) {
          // 使用原生 SQL 插入关联关系
          for (const roleId of roleIds) {
            await dataSource.query(
              'INSERT IGNORE INTO sys_user_role (user_id, role_id) VALUES (?, ?)',
              [user.id, roleId]
            );
          }
          
          this.logger.log(`✅ 用户 ${user.userName} 关联了 ${roleIds.length} 个角色`);
          this.stats.incrementCreated();
        }
      } catch (error) {
        this.logger.error(`❌ 用户-角色关联失败:`, error.message);
        this.stats.incrementFailed();
      }
    }
  }

  private async seedUserPosts(app: any, userPosts: any[]) {
    const userService = app.get(SysUserService);
    const dataSource = app.get(DataSource);

    for (const relation of userPosts) {
      try {
        const user = await userService.findOneByAccount(relation.userAccount);
        
        if (!user) {
          this.logger.warn(`⚠️  用户 ${relation.userAccount} 不存在，跳过`);
          continue;
        }

        if (relation.postIds && relation.postIds.length > 0) {
          for (const postId of relation.postIds) {
            await dataSource.query(
              'INSERT IGNORE INTO sys_user_post (user_id, post_id) VALUES (?, ?)',
              [user.id, postId]
            );
          }
          
          this.logger.log(`✅ 用户 ${user.userName} 关联了 ${relation.postIds.length} 个岗位`);
          this.stats.incrementCreated();
        }
      } catch (error) {
        this.logger.error(`❌ 用户-岗位关联失败:`, error.message);
        this.stats.incrementFailed();
      }
    }
  }

  private async seedUserDepartments(app: any, userDepartments: any[]) {
    const userService = app.get(SysUserService);
    const dataSource = app.get(DataSource);

    for (const relation of userDepartments) {
      try {
        const user = await userService.findOneByAccount(relation.userAccount);
        
        if (!user) {
          this.logger.warn(`⚠️  用户 ${relation.userAccount} 不存在，跳过`);
          continue;
        }

        if (relation.departmentIds && relation.departmentIds.length > 0) {
          for (const deptId of relation.departmentIds) {
            await dataSource.query(
              'INSERT IGNORE INTO sys_user_department (user_id, department_id) VALUES (?, ?)',
              [user.id, deptId]
            );
          }
          
          this.logger.log(`✅ 用户 ${user.userName} 关联了 ${relation.departmentIds.length} 个部门`);
          this.stats.incrementCreated();
        }
      } catch (error) {
        this.logger.error(`❌ 用户-部门关联失败:`, error.message);
        this.stats.incrementFailed();
      }
    }
  }
}
