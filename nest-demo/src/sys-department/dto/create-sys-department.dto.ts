import { IsNotEmpty, IsString, IsOptional, IsInt, IsEmail, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSysDepartmentDto {
  @ApiProperty({ description: '部门名称' })
  @IsNotEmpty({ message: '部门名称不能为空' })
  @IsString()
  name: string;

  @ApiProperty({ description: '部门编码' })
  @IsNotEmpty({ message: '部门编码不能为空' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortNumber?: number;

  @ApiPropertyOptional({ description: '负责人' })
  @IsOptional()
  @IsString()
  leader?: string;

  @ApiPropertyOptional({ description: '负责人电话' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '负责人邮箱' })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiPropertyOptional({ description: '部门地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '父部门ID', default: 0 })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ description: '部门状态 0-禁用 1-启用', default: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  describe?: string;
}