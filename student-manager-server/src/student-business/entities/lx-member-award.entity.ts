import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lx_member_award' })
export class LxMemberAward {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', name: 'sort_number', default: 0 })
  sortNumber: number;

  @Column({ type: 'int', default: 0 })
  status: number;

  @Column({ type: 'datetime', name: 'create_time', nullable: true })
  createTime?: Date | null;

  @Column({ type: 'datetime', name: 'update_time', nullable: true })
  updateTime?: Date | null;
}
