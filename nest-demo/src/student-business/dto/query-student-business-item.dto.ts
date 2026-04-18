import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { STUDENT_BUSINESS_CATEGORIES } from '../student-business.constants';

export class QueryStudentBusinessItemDto {
  @ApiPropertyOptional({ description: '业务分类' })
  @IsOptional()
  @IsString()
  @IsIn(STUDENT_BUSINESS_CATEGORIES, { message: '业务分类不合法' })
  category?: string;

  @ApiPropertyOptional({ description: '标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ description: '微信昵称' })
  @IsOptional()
  @IsString()
  nickName?: string;

  @ApiPropertyOptional({ description: '是否会员' })
  @IsOptional()
  @IsString()
  vipFlag?: string;

  @ApiPropertyOptional({ description: '审核状态' })
  @IsOptional()
  @IsString()
  auditStatus?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
