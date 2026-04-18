import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, OneToMany, 
  ManyToOne, 
  JoinColumn 
} from "typeorm";


@Entity()
export class SysMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'name', comment: '菜单名称', default: null })
  name: string;

  @Column({ type: 'varchar', name: 'code', comment: '菜单编码', default: null })
  code: string;

  @Column({ type: 'int', name: 'sort_number', comment: '排序', default: 0 })
  sortNumber: number;

  // 1：目录，2：菜单，3：按钮
  @Column({ type: 'int', name: 'type', comment: '菜单类型', default: null })
  type: number;

  // 1：平台，2：项目
  @Column({ type: 'int', name: 'category', comment: '菜单分类', default: null })
  category: number;

  @Column({ type: 'varchar', name: 'icon', comment: '菜单图标', default: null })
  icon: string

  @Column({ type: 'varchar', name: 'component', comment: '组件路径', default: null })
  component: string

  @Column({ type: 'varchar', name: 'path', comment: '菜单路径', default: null })
  path: string

  @Column({ type: 'varchar', name: 'permission', comment: '权限标识', default: null })
  permission: string

  @Column({ type: 'int', name: 'status', comment: '菜单状态', default: null })
  status: number

  @Column({ type: 'int', name: 'parent_id', comment: '父级菜单ID', nullable: true, default: null })
  parentId: number | null;

  // 父子关系
  @ManyToOne(() => SysMenu, (menu) => menu.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: SysMenu;

  @OneToMany(() => SysMenu, (menu) => menu.parent)
  children?: SysMenu[];

  @Column({ type: 'varchar', name: 'describe', comment: '权限描述', default: null })
  describe: string;

  @Column({ type: 'varchar', name: 'create_by', comment: '创建人', default: null })
  createBy: string;

  @CreateDateColumn({ type: 'datetime', name: 'create_time', comment: '创建时间', default: null })
  createTime: Date;

  @Column({ type: 'varchar', name: 'update_by', comment: '更新人', default: null })
  updateBy: string;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time', comment: '更新时间', default: null })
  updateTime: Date;
}
