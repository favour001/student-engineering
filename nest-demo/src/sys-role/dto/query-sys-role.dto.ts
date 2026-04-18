import { ApiProperty } from '@nestjs/swagger';

export class QuerySysRoleDto {
  @ApiProperty({
    type: String,
    description: '角色名称',
    required: false,
  })
  name?: string;

  @ApiProperty({
    type: String,
    description: '角色编码',
    required: false,
  })
  code?: string;

  @ApiProperty({
    type: Number,
    description: '状态',
    required: false,
  })
  status?: number;

  @ApiProperty({
    type: Number,
    description: '页码',
    required: false,
  })
  page?: number = 1;

  @ApiProperty({
    type: Number,
    description: '每页条数',
    required: false,
  })
  limit?: number = 10;
}