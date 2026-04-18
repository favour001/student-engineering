import { PartialType } from '@nestjs/swagger';
import { CreateSysPermissionDto } from './create-sys-permission.dto';

export class UpdateSysPermissionDto extends PartialType(CreateSysPermissionDto) {}
