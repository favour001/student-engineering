import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn, MinLength, MaxLength } from 'class-validator';

export class CreateSysRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsString({ message: '角色名称必须是字符串' })
  @IsNotEmpty({ message: '角色名称不能为空' })
  @MinLength(2, { message: '角色名称至少2个字符' })
  @MaxLength(50, { message: '角色名称最多50个字符' })
  name: string;

  @ApiProperty({ description: '角色编码' })
  @IsString({ message: '角色编码必须是字符串' })
  @IsNotEmpty({ message: '角色编码不能为空' })
  @MinLength(2, { message: '角色编码至少2个字符' })
  @MaxLength(30, { message: '角色编码最多30个字符' })
  code: string;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  sortNumber?: number;

  @ApiProperty({ description: '状态 0-启用 1-禁用', required: false })
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MaxLength(200, { message: '描述最多200个字符' })
  describe?: string;

  @ApiProperty({ description: '创建人', required: false })
  @IsOptional()
  @IsString({ message: '创建人必须是字符串' })
  createBy?: string;
}