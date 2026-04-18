import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsIn } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ description: '状态 0:启用 1:禁用' })
  @IsNumber({}, { message: '状态必须是数字' })
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status: number;
}
