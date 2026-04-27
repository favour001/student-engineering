import { Controller, Get, Post, Body, Param, Request, ParseIntPipe } from '@nestjs/common';
import { SysPermissionService } from './sys-permission.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RequirePermissions } from '../decorators/require_permission.decorator';

@ApiTags('权限管理')
@Controller('sys/permission')
export class SysPermissionController {
  constructor(private readonly sysPermissionService: SysPermissionService) {}

  @Get('user/:userId/permissions')
  @ApiOperation({ summary: '获取用户的所有权限标识' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @RequirePermissions('permission:view')
  getUserPermissions(@Param('userId', ParseIntPipe) userId: number) {
    return this.sysPermissionService.getUserPermissions(userId);
  }

  @Get('user/:userId/menu-tree')
  @ApiOperation({ summary: '获取用户的菜单树' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  getUserMenuTree(@Param('userId', ParseIntPipe) userId: number) {
    return this.sysPermissionService.getUserMenuTree(userId);
  }

  @Get('user/:userId/button-permissions')
  @ApiOperation({ summary: '获取用户的按钮权限' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  getUserButtonPermissions(@Param('userId', ParseIntPipe) userId: number) {
    return this.sysPermissionService.getUserButtonPermissions(userId);
  }

  @Get('user/:userId/roles')
  @ApiOperation({ summary: '获取用户的所有角色' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
    return this.sysPermissionService.getUserRoles(userId);
  }

  @Get('role/:roleId/menus')
  @ApiOperation({ summary: '获取角色的菜单权限' })
  @ApiParam({ name: 'roleId', description: '角色ID' })
  @RequirePermissions('permission:view')
  getRoleMenus(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.sysPermissionService.getRoleMenusByRoleId(roleId);
  }

  @Get('menu-tree')
  @ApiOperation({ summary: '获取所有菜单权限树' })
  @RequirePermissions('permission:view')
  getAllMenuTree() {
    return this.sysPermissionService.getAllMenuTree();
  }

  @Post('role/:roleId/assign-menus')
  @ApiOperation({ summary: '为角色分配菜单权限' })
  @ApiParam({ name: 'roleId', description: '角色ID' })
  @RequirePermissions('permission:edit')
  async assignMenusToRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body('menuIds') menuIds: number[]
  ) {
    await this.sysPermissionService.assignMenusToRole(roleId, menuIds);
    return { message: '分配成功' };
  }

  @Post('check-permission')
  @ApiOperation({ summary: '检查用户是否有指定权限' })
  async checkPermission(
    @Body('userId') userId: number,
    @Body('permission') permission: string
  ) {
    const hasPermission = await this.sysPermissionService.hasPermission(userId, permission);
    return { hasPermission };
  }

  @Post('check-any-permission')
  @ApiOperation({ summary: '检查用户是否有任意一个权限' })
  async checkAnyPermission(
    @Body('userId') userId: number,
    @Body('permissions') permissions: string[]
  ) {
    const hasPermission = await this.sysPermissionService.hasAnyPermission(userId, permissions);
    return { hasPermission };
  }

  @Post('check-all-permissions')
  @ApiOperation({ summary: '检查用户是否有所有指定权限' })
  async checkAllPermissions(
    @Body('userId') userId: number,
    @Body('permissions') permissions: string[]
  ) {
    const hasPermission = await this.sysPermissionService.hasAllPermissions(userId, permissions);
    return { hasPermission };
  }
}
