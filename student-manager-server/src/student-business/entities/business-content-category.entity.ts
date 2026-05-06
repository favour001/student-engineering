import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'business_content_category' })
export class BusinessContentCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'business_key', length: 64, comment: '所属业务' })
  businessKey: string;

  @Column({ type: 'varchar', length: 100, comment: '分类名称' })
  name: string;

  @Column({ type: 'varchar', length: 100, comment: '分类编码' })
  code: string;

  @Column({ type: 'int', name: 'sort_number', default: 0, comment: '排序' })
  sortNumber: number;

  @Column({ type: 'int', default: 0, comment: '状态 0启用 1禁用' })
  status: number;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  updateTime: Date;
}
