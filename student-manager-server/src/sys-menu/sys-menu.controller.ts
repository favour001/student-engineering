import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, Put } from '@nestjs/common';
import { SysMenuService } from './sys-menu.service';
import { CreateSysMenuDto } from './dto/create-sys-menu.dto';
import { UpdateSysMenuDto } from './dto/update-sys-menu.dto';
import { QuerySysMenuDto } from './dto/query-sys-menu.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SysPermissionService } from '../sys-permission/sys-permission.service';
import { RequirePermissions } from '../decorators/require_permission.decorator';

@ApiTags('菜单管理')
@Controller('sys/menu')
export class SysMenuController {
  constructor(
    private readonly sysMenuService: SysMenuService,
    private readonly permissionService: SysPermissionService
  ) {}

  @Post()
  @ApiOperation({ summary: '添加菜单' })
  @RequirePermissions('menu:add')
  create(@Body() createSysMenuDto: CreateSysMenuDto) {
    return this.sysMenuService.create(createSysMenuDto);
  }

  @Get()
  @ApiOperation({ summary: '获取菜单列表（分页）' })
  @RequirePermissions('menu:list')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() querySysMenu: QuerySysMenuDto,
  ) {
    return this.sysMenuService.findAll(page, limit, querySysMenu);
  }

  @Get('list')
  @ApiOperation({ summary: '获取所有菜单（不分页）' })
  @RequirePermissions('menu:list')
  findAllList() {
    return this.sysMenuService.findAllList();
  }

  @Get('active')
  @ApiOperation({ summary: '获取启用的菜单' })
  findActiveList() {
    return this.sysMenuService.findActiveList();
  }

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树（含权限过滤）' })
  @RequirePermissions('menu:list')
  findTree() {
    // 使用 permission service 的树形结构方法
    return this.permissionService.getAllMenuTree();
  }

  @Get('type/:type')
  @ApiOperation({ summary: '根据类型获取菜单' })
  findByType(@Param('type') type: string) {
    return this.sysMenuService.findByType(+type);
  }

  @Get('user-menus')
  @ApiOperation({ summary: '获取当前用户菜单' })
  async getUserMenus(@Request() req) {
    return this.permissionService.getUserMenuTree(req.user.id);
  }

  @Get('user-permissions')
  @ApiOperation({ summary: '获取当前用户权限' })
  async getUserPermissions(@Request() req) {
    console.log('=== getUserPermissions Debug ===');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    console.log('Authorization header:', req.headers?.authorization);
    
    if (!req.user || !req.user.id) {
      throw new Error('User not authenticated or user ID not found in request');
    }
    
    const permissions = await this.permissionService.getUserPermissions(req.user.id);
    const buttonPermissions = await this.permissionService.getUserButtonPermissions(req.user.id);
    
    return {
      permissions,
      buttonPermissions
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '根据id获取菜单详情' })
  @RequirePermissions('menu:detail')
  findOne(@Param('id') id: string) {
    return this.sysMenuService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新菜单' })
  @RequirePermissions('menu:edit')
  update(@Param('id') id: string, @Body() updateSysMenuDto: UpdateSysMenuDto) {
    return this.sysMenuService.update(+id, updateSysMenuDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新菜单状态' })
  @RequirePermissions('menu:edit')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: number
  ) {
    return this.sysMenuService.updateStatus(+id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  @RequirePermissions('menu:delete')
  remove(@Param('id') id: string) {
    return this.sysMenuService.remove(+id);
  }
}