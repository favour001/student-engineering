import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'lx_ruhui' })
export class LxRuhui {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'varchar', name: 'avater_url', length: 500, nullable: true, comment: '图片地址' })
  avaterUrl?: string | null;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  remark?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  updateTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;
}
