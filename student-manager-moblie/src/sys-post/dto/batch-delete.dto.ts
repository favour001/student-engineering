import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class PostBatchDeleteDto {
  @ApiProperty({ description: '岗位ID数组', type: [Number] })
  @IsArray({ message: 'ids必须是数组' })
  @ArrayMinSize(1, { message: '至少选择一个岗位' })
  @IsNumber({}, { each: true, message: '每个ID必须是数字' })
  ids: number[];
}
