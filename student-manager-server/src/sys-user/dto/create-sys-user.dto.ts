import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateSysUserDto {

  @ApiProperty({
    type: String,
    description: '用户名',
  })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(2, { message: '用户名至少2个字符' })
  @MaxLength(50, { message: '用户名最多50个字符' })
  userName: string;

  @ApiProperty({
    type: String,
    description: '登录账号',
  })
  @IsString({ message: '登录账号必须是字符串' })
  @IsNotEmpty({ message: '登录账号不能为空' })
  @MinLength(3, { message: '登录账号至少3个字符' })
  @MaxLength(30, { message: '登录账号最多30个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '登录账号只能包含字母、数字和下划线' })
  account: string;

  @ApiProperty({
    type: String,
    description: '密码',
  })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6个字符' })
  @MaxLength(100, { message: '密码最多100个字符' })
  password: string;

  @ApiProperty({
    type: String,
    description: '性别 0:男 1:女',
    required: false
  })
  @IsOptional()
  @IsString({ message: '性别必须是字符串' })
  sex?: string;

  @ApiProperty({
    type: String,
    description: '邮箱',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({
    type: String,
    description: '手机号码',
    required: false
  })
  @IsOptional()
  @IsString({ message: '手机号码必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号码格式不正确' })
  phoneNumber?: string;

  @ApiProperty({
    type: String,
    description: '头像',
    required: false
  })
  @IsOptional()
  @IsString({ message: '头像必须是字符串' })
  profileImage?: string;

  @ApiProperty({
    type: Number,
    description: '应用状态，0:启用，1:禁用',
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  status?: number;

  @ApiProperty({
    type: Number,
    description: '删除状态，0:禁止删除，1:允许删除',
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: '删除状态必须是数字' })
  delStatus?: number;
  
}
