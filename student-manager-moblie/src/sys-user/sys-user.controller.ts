import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { SysUserService } from './sys-user.service';
import { CreateSysUserDto } from './dto/create-sys-user.dto';
import { UpdateSysUserDto } from './dto/update-sys-user.dto';
import { QuerySysUserDto } from './dto/query-sys-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserBatchDeleteDto } from './dto/batch-delete.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequirePermissions } from '../decorators/require_permission.decorator';

@ApiTags('系统用户管理')
@Controller('sys/user')
export class SysUserController {
  constructor(private readonly sysUserService: SysUserService) {}

  @Post()
  @ApiOperation({ summary: '添加用户' })
  @RequirePermissions('user:add') // 需要用户新增权限
  create(@Body() createSysUserDto: CreateSysUserDto) {
    return this.sysUserService.create(createSysUserDto);
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @RequirePermissions('user:list') // 需要用户查询权限
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() querySysUser: QuerySysUserDto
  ) {
    return this.sysUserService.findAll(page, limit, querySysUser);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据用户id获取用户详情' })
  @RequirePermissions('user:detail') // 需要用户查看权限
  findOne(@Param('id') id: string) {
    return this.sysUserService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('user:edit') // 需要用户编辑权限
  update(@Param('id') id: string, @Body() updateSysUserDto: UpdateSysUserDto) {
    return this.sysUserService.update(+id, updateSysUserDto);
  }

  @Delete(':id')
  @RequirePermissions('user:delete')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id') id: string) {
    return this.sysUserService.remove(+id);
  }

  @Delete('batch/delete')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('user:delete')
  @ApiOperation({ summary: '批量删除用户' })
  batchDelete(@Body() batchDeleteDto: UserBatchDeleteDto) {
    return this.sysUserService.batchDelete(batchDeleteDto.ids);
  }

  @Put(':id/status')
  @RequirePermissions('user:edit')
  @ApiOperation({ summary: '更新用户状态' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    return this.sysUserService.updateStatus(+id, updateStatusDto.status);
  }

  @Put(':id/soft-delete')
  @RequirePermissions('user:delete')
  @ApiOperation({ summary: '软删除用户（禁用）' })
  softDelete(@Param('id') id: string) {
    return this.sysUserService.softDelete(+id);
  }

  @Put(':id/change-password')
  @RequirePermissions('user:edit')
  @ApiOperation({ summary: '修改密码' })
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.sysUserService.changePassword(+id, changePasswordDto.oldPassword, changePasswordDto.newPassword);
  }

  @Put(':id/reset-password')
  @RequirePermissions('user:edit')
  @ApiOperation({ summary: '重置密码' })
  resetPassword(
    @Param('id') id: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    return this.sysUserService.resetPassword(+id, resetPasswordDto.newPassword);
  }
}
