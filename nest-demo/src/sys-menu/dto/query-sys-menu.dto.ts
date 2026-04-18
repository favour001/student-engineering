import { ApiProperty } from '@nestjs/swagger';

export class QuerySysMenuDto {
  @ApiProperty({
    type: String,
    description: '菜单名称',
    required: false,
  })
  name?: string;

  @ApiProperty({
    type: String,
    description: '菜单编码',
    required: false,
  })
  code?: string;

  @ApiProperty({
    type: Number,
    description: '菜单类型：1-目录，2-菜单，3-按钮',
    required: false,
  })
  type?: number;

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