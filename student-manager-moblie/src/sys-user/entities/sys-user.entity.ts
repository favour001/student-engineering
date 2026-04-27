import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from "typeorm";
import { SysRole } from "../../sys-role/entities/sys-role.entity";
import { SysPost } from "../../sys-post/entities/sys-post.entity";
import { SysDepartment } from "../../sys-department/entities/sys-department.entity";

@Entity()
export class SysUser {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', name: 'user_name', comment: '用户名', default: null })
    userName: string;

    @Column({ type: 'varchar', name: 'sex', comment: '性别', default: null })
    sex: string;
    
    @Column({ type: 'varchar', name: 'phone_number', comment: '手机号码', default: null })
    phoneNumber: string;

    @Column({ type: 'varchar', name: 'profile_image', comment: '头像', default: null })
    profileImage: string;

    @Column({ type: 'varchar', name: 'email', comment: '邮箱', default: null })
    email: string;

    @Column({ type: 'int', name: 'status', comment: '状态', default: 0 })
    status: number;

    @Column({ type: 'int', name: 'del_status', comment: '删除状态', default: 0 })
    delStatus: number;

    @Column({ type: 'varchar', name: 'account', comment: '登录名', default: null })
    account: string;

    @Column({ type: 'varchar', name: 'password', comment: '密码', default: null })
    password: string;

    @ManyToMany(() => SysDepartment)
    @JoinTable({ 
      name: 'sys_user_department',
      joinColumn: {name: 'user_id'},
      inverseJoinColumn: {name: 'department_id'}
    })
    department: SysDepartment;

    @ManyToMany(() => SysPost)
    @JoinTable({ 
        name: 'sys_user_post',
        joinColumn: {name: 'user_id'},
        inverseJoinColumn: {name: 'post_id'}
    })
    sysUserPosts: SysPost[];
                                                                                                   
    @ManyToMany(() => SysRole)
    @JoinTable({ 
      name: 'sys_user_role',
      joinColumn: {name: 'user_id'},
      inverseJoinColumn: {name: 'role_id'}
    })
    roles: SysRole[]; 

    @Column({ type: 'varchar', name: 'create_by', comment: '创建人', default: null })
    createBy: string;

    @Column({ type: 'datetime', name: 'create_time', comment: '创建时间', default: null })
    createTime: Date;

    @Column({ type: 'varchar', name: 'update_by', comment: '更新人', default: null })
    updateBy: string;

    @Column({ type: 'datetime', name: 'update_time', comment: '更新时间', default: null })
    updateTime: Date;

    
}
