import { PartialType } from '@nestjs/swagger';
import { CreateStudentBusinessItemDto } from './create-student-business-item.dto';

export class UpdateStudentBusinessItemDto extends PartialType(
  CreateStudentBusinessItemDto,
) {}
