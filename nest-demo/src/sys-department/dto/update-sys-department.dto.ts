import { PartialType } from '@nestjs/swagger';
import { CreateSysDepartmentDto } from './create-sys-department.dto';

export class UpdateSysDepartmentDto extends PartialType(CreateSysDepartmentDto) {}
