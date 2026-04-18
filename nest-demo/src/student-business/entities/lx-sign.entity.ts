import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_sign' })
export class LxSign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id', comment: '报名人ID' })
  userId: string;

  @Column({ type: 'bigint', name: 'activity_id', comment: '活动ID' })
  activityId: string;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;
}
