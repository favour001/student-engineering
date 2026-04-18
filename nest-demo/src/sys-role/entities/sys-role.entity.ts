import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { SysMenu } from "../../sys-menu/entities/sys-menu.entity";

@Entity()
export class SysRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'name', comment: '角色名称', default: null })
  name: string;

  @Column({ type: 'varchar', name: 'code', comment: '角色编码', default: null })
  code: string;

  @Column({ type: 'int', name: 'sort_number', comment: '排序', default: 0 })
  sortNumber: number;

  @Column({ type: 'int', name: 'status', comment: '状态', default: 0 })
  status: number;

  @Column({ type: 'varchar', name: 'describe', comment: '描述', default: null })
  describe: string; 

  @ManyToMany(() => SysMenu)
  @JoinTable({ 
    name: 'sys_role_menu',
    joinColumn: {name: 'role_id'},
    inverseJoinColumn: {name: 'menu_id'}
  })
  menus: SysMenu[];

  @Column({ type: 'varchar', name: 'create_by', comment: '创建人', default: null })
  createBy: string;

  @Column({ type: 'datetime', name: 'create_time', comment: '创建时间', default: null })
  createTime: Date;

  @Column({ type: 'varchar', name: 'update_by', comment: '更新人', default: null })
  updateBy: string;

  @Column({ type: 'datetime', name: 'update_time', comment: '更新时间', default: null })
  updateTime: Date;
}
