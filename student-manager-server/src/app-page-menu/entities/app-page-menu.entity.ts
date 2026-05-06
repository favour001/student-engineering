import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'app_page_menu' })
export class AppPageMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80, comment: '页面名称' })
  name: string;

  @Column({ type: 'varchar', length: 200, comment: '小程序页面路径' })
  path: string;

  @Column({ type: 'varchar', length: 80, nullable: true, comment: '图标标识' })
  icon?: string | null;

  @Column({ type: 'int', name: 'sort_number', default: 0, comment: '排序' })
  sortNumber: number;

  @Column({ type: 'tinyint', default: 0, comment: '状态 0启用 1禁用' })
  status: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  updateTime: Date;
}
