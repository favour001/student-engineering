import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class QuerySysDepartmentDto {
  @ApiPropertyOptional({ description: '部门名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '部门编码' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '负责人' })
  @IsOptional()
  @IsString()
  leader?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsInt()
  status?: number;
}
