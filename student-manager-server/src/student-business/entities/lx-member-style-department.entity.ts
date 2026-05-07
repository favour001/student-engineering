import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lx_member_style_department' })
export class LxMemberStyleDepartment {
  @PrimaryColumn({ type: 'bigint', name: 'member_style_id' })
  memberStyleId: number;

  @PrimaryColumn({ type: 'bigint', name: 'department_id' })
  departmentId: number;
}
