import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_user_notice' })
export class LxUserNotice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'tinyint', default: 0, comment: '发布状态 0启用 1禁用' })
  releases: number;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  remark?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;
}
