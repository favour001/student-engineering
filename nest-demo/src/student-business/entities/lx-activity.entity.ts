import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_activity' })
export class LxActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'datetime', name: 'start_time', nullable: true, comment: '开始时间' })
  startTime?: Date | null;

  @Column({ type: 'datetime', name: 'end_time', nullable: true, comment: '结束时间' })
  endTime?: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '地址' })
  address?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '金额' })
  money?: string | null;

  @Column({ type: 'text', nullable: true, comment: '活动内容' })
  remark?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '活动状态' })
  status?: string | null;

  @Column({ type: 'varchar', name: 'avater_url', length: 500, nullable: true, comment: '封面照片' })
  avaterUrl?: string | null;

  @Column({ type: 'varchar', name: 'label_name', length: 100, nullable: true, comment: '标签名' })
  labelName?: string | null;

  @Column({ type: 'varchar', name: 'contact_name', length: 100, nullable: true, comment: '联系人姓名' })
  contactName?: string | null;

  @Column({ type: 'varchar', name: 'contact_mobile', length: 50, nullable: true, comment: '联系人手机' })
  contactMobile?: string | null;

  @Column({ type: 'int', name: 'sign_quota', default: 0, comment: '报名人数限额' })
  signQuota: number;

  @Column({ type: 'varchar', name: 'sign_type', length: 100, nullable: true, comment: '报名人员类型' })
  signType?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;
}
