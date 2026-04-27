import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_article' })
export class LxArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'order_number', default: 0, comment: '排序' })
  orderNumber: number;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'varchar', name: 'article_url', length: 500, nullable: true, comment: '文章地址' })
  articleUrl?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '类型' })
  type?: string | null;

  @Column({ type: 'longtext', name: 'content_type', nullable: true, comment: '内容详情' })
  contentType?: string | null;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;
}
