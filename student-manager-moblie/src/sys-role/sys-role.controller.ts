import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { SysRoleService } from './sys-role.service';
import { CreateSysRoleDto } from './dto/create-sys-role.dto';
import { UpdateSysRoleDto } from './dto/update-sys-role.dto';
import { QuerySysRoleDto } from './dto/query-sys-role.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SysPermissionService } from '../sys-permission/sys-permission.service';
import { RequirePermissions } from '../decorators/require_permission.decorator';

@ApiTags('角色管理')
@Controller('sys/role')
export class SysRoleController {
  constructor(
    private readonly sysRoleService: SysRoleService,
    private readonly permissionService: SysPermissionService
  ) {}

  @Post()
  @ApiOperation({ summary: '添加角色' })
  @RequirePermissions('role:add')
  create(@Body() createSysRoleDto: CreateSysRoleDto) {
    return this.sysRoleService.create(createSysRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '获取角色列表（分页）' })
  @RequirePermissions('role:list')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() querySysRole: QuerySysRoleDto,
  ) {
    return this.sysRoleService.findAll(page, limit, querySysRole);
  }

  @Get('list')
  @ApiOperation({ summary: '获取所有角色（不分页）' })
  @RequirePermissions('role:list')
  findAllList() {
    return this.sysRoleService.findAllList();
  }

  @Get('active')
  @ApiOperation({ summary: '获取启用的角色' })
  findActiveList() {
    return this.sysRoleService.findActiveList();
  }

  @Get('stats')
  @ApiOperation({ summary: '获取角色统计' })
  getStats() {
    return this.sysRoleService.countByStatus();
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据编码查询角色' })
  @ApiParam({ name: 'code', description: '角色编码' })
  findByCode(@Param('code') code: string) {
    return this.sysRoleService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据id获取角色详情' })
  @RequirePermissions('role:view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sysRoleService.findOne(id);
  }

  @Get(':id/with-menus')
  @ApiOperation({ summary: '获取角色详情（包含菜单）' })
  @RequirePermissions('role:view')
  findOneWithMenus(@Param('id', ParseIntPipe) id: number) {
    return this.sysRoleService.findOneWithMenus(id);
  }

  @Get(':id/menus')
  @ApiOperation({ summary: '获取角色的菜单权限' })
  @RequirePermissions('role:view')
  getRoleMenus(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.getRoleMenusByRoleId(id);
  }

  @Get(':id/users')
  @ApiOperation({ summary: '获取角色下的用户列表' })
  @ApiParam({ name: 'id', description: '角色ID' })
  getRoleUsers(@Param('id', ParseIntPipe) id: number) {
    return this.sysRoleService.getRoleUsers(id);
  }

  @Get(':id/user-count')
  @ApiOperation({ summary: '获取角色下的用户数量' })
  @ApiParam({ name: 'id', description: '角色ID' })
  async getRoleUserCount(@Param('id', ParseIntPipe) id: number) {
    const count = await this.sysRoleService.getRoleUserCount(id);
    return { count };
  }

  @Post(':id/menus')
  @ApiOperation({ summary: '为角色分配菜单权限' })
  @RequirePermissions('role:edit')
  async assignMenus(@Param('id', ParseIntPipe) id: number, @Body() body: { menuIds: number[] }) {
    await this.permissionService.assignMenusToRole(id, body.menuIds);
    return { message: '分配成功' };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色' })
  @RequirePermissions('role:edit')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSysRoleDto: UpdateSysRoleDto) {
    return this.sysRoleService.update(id, updateSysRoleDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新角色状态' })
  @RequirePermissions('role:edit')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.sysRoleService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @RequirePermissions('role:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sysRoleService.remove(id);
  }
}