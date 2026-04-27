import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_merchant' })
export class LxMerchant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({
    type: 'varchar',
    name: 'cover_url',
    length: 500,
    nullable: true,
    comment: '封面地址',
  })
  coverUrl?: string | null;

  @Column({ type: 'longtext', nullable: true, comment: '描述内容' })
  content?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;
}
