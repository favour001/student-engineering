import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsNumber,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { STUDENT_BUSINESS_CATEGORIES } from '../student-business.constants';

export class CreateStudentBusinessItemDto {
  @ApiProperty({ description: '业务分类' })
  @IsString()
  @MaxLength(64)
  @IsIn(STUDENT_BUSINESS_CATEGORIES, { message: '业务分类不合法' })
  category: string;

  @ApiProperty({ description: '标题' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: '副标题' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subTitle?: string;

  @ApiPropertyOptional({ description: '摘要' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @ApiPropertyOptional({ description: '正文内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '封面图地址' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @ApiPropertyOptional({ description: '外链地址' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  externalUrl?: string;

  @ApiPropertyOptional({ description: '来源' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @ApiPropertyOptional({ description: '作者' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;

  @ApiPropertyOptional({ description: '手机号/联系方式' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mobile?: string;

  @ApiPropertyOptional({ description: '标签，多个以逗号分隔' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tags?: string;

  @ApiPropertyOptional({ description: '业务分类ID' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortNumber?: number;

  @ApiPropertyOptional({ description: '状态 0启用 1禁用', default: 0 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '是否置顶 0否 1是', default: 0 })
  @IsOptional()
  @IsInt()
  isTop?: number;

  @ApiPropertyOptional({ description: '发布时间' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ description: '金额' })
  @IsOptional()
  @IsNumber()
  money?: number;

  @ApiPropertyOptional({ description: '联系人' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName?: string;

  @ApiPropertyOptional({ description: '联系人手机号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactMobile?: string;

  @ApiPropertyOptional({ description: '数量/名额' })
  @IsOptional()
  @IsInt()
  quantity?: number;

  @ApiPropertyOptional({ description: '扩展类型字段' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  extraType?: string;

  @ApiPropertyOptional({ description: '规则说明' })
  @IsOptional()
  @IsString()
  rule?: string;

  @ApiPropertyOptional({ description: '会员描述' })
  @IsOptional()
  @IsString()
  membershipDescribe?: string;

  @ApiPropertyOptional({ description: '折扣方式' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  discountType?: string;

  @ApiPropertyOptional({ description: '折扣值' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  discount?: string;

  @ApiPropertyOptional({ description: '关联ID' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relationId?: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  userId?: string;

  @ApiPropertyOptional({ description: '使用状态' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  useStatus?: string;

  @ApiPropertyOptional({ description: '英文名' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  userEnglishName?: string;

  @ApiPropertyOptional({ description: '会员编号' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  orderNumber?: string;

  @ApiPropertyOptional({ description: '留学国家/地区' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  studyCountry?: string;

  @ApiPropertyOptional({ description: '留学学校' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  studySchool?: string;

  @ApiPropertyOptional({ description: '专业' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  major?: string;

  @ApiPropertyOptional({ description: '证书地址' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  certificate?: string;

  @ApiPropertyOptional({ description: '性别' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @ApiPropertyOptional({ description: '单位名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @ApiPropertyOptional({ description: '是否会员' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  vipFlag?: string;

  @ApiPropertyOptional({ description: '单位职位' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyPost?: string;

  @ApiPropertyOptional({ description: '单位地址' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyAddress?: string;

  @ApiPropertyOptional({ description: '审核状态' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  auditStatus?: string;

  @ApiPropertyOptional({ description: '社会职务' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  socialPost?: string;

  @ApiPropertyOptional({ description: '微信昵称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickName?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: '籍贯' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nativePlace?: string;

  @ApiPropertyOptional({ description: '生日' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ description: '展示名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({ description: '岗位头衔' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  jobTitle?: string;

  @ApiPropertyOptional({ description: '系统岗位ID' })
  @IsOptional()
  @IsInt()
  postId?: number;

  @ApiPropertyOptional({ description: '系统岗位ID列表' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  postIds?: number[];

  @ApiPropertyOptional({ description: '系统部门ID' })
  @IsOptional()
  @IsInt()
  deptId?: number;

  @ApiPropertyOptional({ description: '系统部门ID列表' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  deptIds?: number[];

  @ApiPropertyOptional({ description: '奖项ID列表' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  awardIds?: number[];

  @ApiPropertyOptional({ description: '成员排序文案' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  memberRank?: string;

  @ApiPropertyOptional({ description: '背景图地址' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  backgroundImage?: string;

  @ApiPropertyOptional({ description: '荣誉简介' })
  @IsOptional()
  @IsString()
  honorRemark?: string;

  @ApiPropertyOptional({ description: '企业信息' })
  @IsOptional()
  @IsString()
  companyRemark?: string;

  @ApiPropertyOptional({ description: '岗位信息' })
  @IsOptional()
  @IsString()
  jobRemark?: string;
}
