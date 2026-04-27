import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_user_manager' })
export class LxUserManager {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'user_name', length: 100, comment: '用户名称' })
  userName: string;

  @Column({ type: 'varchar', name: 'avater_url', length: 500, nullable: true, comment: '头像地址' })
  avaterUrl?: string | null;

  @Column({ type: 'datetime', name: 'reg_date', nullable: true, comment: '入职日期' })
  regDate?: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '手机号' })
  mobile?: string | null;

  @Column({ type: 'text', nullable: true, comment: '介绍' })
  remark?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;
}
