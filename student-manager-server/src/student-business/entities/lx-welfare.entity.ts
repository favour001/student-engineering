import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_welfare' })
export class LxWelfare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'varchar', name: 'avater_url', length: 500, nullable: true, comment: '图片地址' })
  avaterUrl?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '金额' })
  money?: string | null;

  @Column({ type: 'varchar', name: 'discount_type', length: 100, nullable: true, comment: '折扣方式' })
  discountType?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '折扣' })
  discount?: string | null;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  remark?: string | null;

  @Column({ type: 'text', nullable: true, comment: '使用规则' })
  rule?: string | null;

  @Column({ type: 'bigint', name: 'category_id', nullable: true, comment: '业务分类ID' })
  categoryId?: number | null;

  @Column({ type: 'datetime', name: 'start_time', nullable: true, comment: '开始时间' })
  startTime?: Date | null;

  @Column({ type: 'datetime', name: 'end_time', nullable: true, comment: '结束时间' })
  endTime?: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;
}
