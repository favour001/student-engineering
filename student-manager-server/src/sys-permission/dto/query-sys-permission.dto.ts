import { ApiProperty } from '@nestjs/swagger';

export class QuerySysPermissionDto {
  @ApiProperty({
    type: Number,
    description: '用户ID',
    required: false,
  })
  userId?: number;

  @ApiProperty({
    type: Number,
    description: '角色ID',
    required: false,
  })
  roleId?: number;

  @ApiProperty({
    type: String,
    description: '权限标识',
    required: false,
  })
  permission?: string;
}