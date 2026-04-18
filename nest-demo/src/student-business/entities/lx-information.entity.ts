import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_information' })
export class LxInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'order_number', default: 0, comment: '排序' })
  orderNumber: number;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'varchar', name: 'information_url', length: 500, nullable: true, comment: '资讯地址' })
  informationUrl?: string | null;

  @Column({ type: 'longtext', name: 'information_content', nullable: true, comment: '资讯内容' })
  informationContent?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '类型' })
  type?: string | null;

  @Column({ type: 'varchar', name: 'content_type', length: 100, nullable: true, comment: '内容类型' })
  contentType?: string | null;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;
}
