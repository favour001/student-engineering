import { PartialType } from '@nestjs/swagger';
import { CreateSysPostDto } from './create-sys-post.dto';

export class UpdateSysPostDto extends PartialType(CreateSysPostDto) {}
