import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn, MinLength, MaxLength } from 'class-validator';

export class CreateSysMenuDto {
  @ApiProperty({ description: '菜单名称' })
  @IsString({ message: '菜单名称必须是字符串' })
  @IsNotEmpty({ message: '菜单名称不能为空' })
  @MinLength(2, { message: '菜单名称至少2个字符' })
  @MaxLength(50, { message: '菜单名称最多50个字符' })
  name: string;

  @ApiProperty({ description: '菜单编码' })
  @IsString({ message: '菜单编码必须是字符串' })
  @IsNotEmpty({ message: '菜单编码不能为空' })
  @MinLength(2, { message: '菜单编码至少2个字符' })
  @MaxLength(50, { message: '菜单编码最多50个字符' })
  code: string;

  @ApiProperty({ description: '菜单类型：1-目录，2-菜单，3-按钮' })
  @IsNumber({}, { message: '菜单类型必须是数字' })
  @IsIn([1, 2, 3], { message: '菜单类型只能是1、2或3' })
  type: number;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  sortNumber?: number;

  @ApiProperty({ description: '菜单图标', required: false })
  @IsOptional()
  @IsString({ message: '菜单图标必须是字符串' })
  icon?: string;

  @ApiProperty({ description: '组件路径', required: false })
  @IsOptional()
  @IsString({ message: '组件路径必须是字符串' })
  component?: string;

  @ApiProperty({ description: '菜单路径', required: false })
  @IsOptional()
  @IsString({ message: '菜单路径必须是字符串' })
  path?: string;

  @ApiProperty({ description: '权限标识', required: false })
  @IsOptional()
  @IsString({ message: '权限标识必须是字符串' })
  permission?: string;

  @ApiProperty({ description: '父菜单ID', required: false })
  @IsOptional()
  @IsNumber({}, { message: '父菜单ID必须是数字' })
  parentId?: number;

  @ApiProperty({ description: '状态 0:启用 1:禁用', required: false })
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MaxLength(200, { message: '描述最多200个字符' })
  describe?: string;
}