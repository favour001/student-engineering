import { PartialType } from '@nestjs/swagger';
import { CreateSysRoleDto } from './create-sys-role.dto';

export class UpdateSysRoleDto extends PartialType(CreateSysRoleDto) {}
