import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class QuerySysUserDto {

  @ApiProperty({
    type: String,
    description: '用户名',
    required: false
  })
  userName?: string;

  @ApiPropertyOptional({
    type: String,
    description: '登录账号',
  })
  account?: string;

  @ApiPropertyOptional({
    type: String,
    description: '手机号',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    type: Number,
    description: '状态',
  })
  status?: number;

  @ApiPropertyOptional({
    type: String,
    description: '性别',
  })
  sex?: string;

  @ApiProperty({
    type: Number,
    description: '页码',
    required: false
  })
  page?: number = 1;

  @ApiProperty({
    type: Number,
    description: '每页条数',
    required: false
  })
  limit?: number = 10;
}
