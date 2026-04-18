import { ApiProperty } from '@nestjs/swagger';

import { RESPONSE_CODE, RESPONSE_MSG } from '../enums';

export class ResponseDto {
  @ApiProperty({
    type: Number,
    description: '业务状态码',
    default: RESPONSE_CODE.SUCCESS,
  })
  code: number;

  @ApiProperty({
    type: String,
    description: '业务信息',
    default: RESPONSE_MSG.SUCCESS,
  })
  msg: string;

  @ApiProperty({ description: '业务数据' })
  data?: any;

  @ApiProperty({ type: Number, description: '时间戳', default: 1720685424078 })
  timestamp: number;
}