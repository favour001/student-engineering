import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity()
export class SysDepartment {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'name', comment: '部门名称', default: null })
  name: string;

  @Column({ type: 'varchar', name: 'code', comment: '部门编码', default: null })
  code: string;

  @Column({ type: 'int', name: 'sort_number', comment: '排序', default: 0 })
  sortNumber: number;
  
  @Column({ type: 'varchar', name: 'leader', comment: '负责人', default: null })
  leader: string;

  @Column({ type: 'varchar', name: 'phone', comment: '负责人电话', default: null })
  phone: string;
  
  @Column({ type: 'varchar', name: 'email', comment: '负责人邮箱', default: null })
  email: string;

  @Column({ type: 'varchar', name: 'address', comment: '部门地址', default: null })
  address: string;

  @Column({ type: 'int', name: 'parent_id', comment: '父部门id', default: 0 })
  parentId: number;

  @Column({ type: 'int', name: 'status', comment: '部门状态', default: 0 })
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
