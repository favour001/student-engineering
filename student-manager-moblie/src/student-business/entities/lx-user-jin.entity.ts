import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_user_jin' })
export class LxUserJin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'varchar', name: 'avater_url', length: 500, nullable: true, comment: '图片地址' })
  avaterUrl?: string | null;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  remark?: string | null;

  @Column({ type: 'tinyint', default: 0, comment: '发布状态 0启用 1禁用' })
  releases: number;

  @Column({ type: 'varchar', name: 'point_url', length: 500, nullable: true, comment: '跳转地址' })
  pointUrl?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;
}
