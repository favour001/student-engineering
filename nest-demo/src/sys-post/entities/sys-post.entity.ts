import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SysPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'name', comment: '岗位名称', default: null })
  name: string;

  @Column({ type: 'varchar', name: 'code', comment: '岗位编码', default: null })
  code: string;

  @Column({ type: 'int', name: 'sort_number', comment: '排序', default: 0 })
  sortNumber: number;

  @Column({ type: 'int', name: 'status', comment: '状态', default: 0 })
  status: number;

  @Column({ type: 'varchar', name: 'describe', comment: '描述', default: null })
  describe: string;

  @Column({ type: 'varchar', name: 'create_by', comment: '创建人', default: null })
  createBy: string;

  @Column({ type: 'datetime', name: 'create_time', comment: '创建时间', default: null })
  createTime: Date;

  @Column({ type: 'varchar', name: 'update_by', comment: '更新人', default: null })
  updateBy: string;

  @Column({ type: 'datetime', name: 'update_time', comment: '更新时间', default: null })
  updateTime: Date;
}
