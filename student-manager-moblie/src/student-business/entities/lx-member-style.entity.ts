import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lx_member_style' })
export class LxMemberStyle {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'legacy_user_id', nullable: true, unique: true })
  legacyUserId?: number | null;

  @Column({ type: 'bigint', name: 'order_number', nullable: true })
  orderNumber?: number | null;

  @Column({ type: 'varchar', name: 'user_name', length: 100, comment: '成员姓名' })
  userName: string;

  @Column({ type: 'varchar', name: 'display_name', length: 100, nullable: true, comment: '展示名' })
  displayName?: string | null;

  @Column({ type: 'varchar', name: 'job_title', length: 128, nullable: true, comment: '岗位头衔' })
  jobTitle?: string | null;

  @Column({ type: 'varchar', name: 'member_rank', length: 64, nullable: true, comment: '成员排序文案' })
  memberRank?: string | null;

  @Column({ type: 'datetime', name: 'joined_at', nullable: true, comment: '加入时间' })
  joinedAt?: Date | null;

  @Column({ type: 'varchar', name: 'mobile', length: 32, nullable: true, comment: '手机号' })
  mobile?: string | null;

  @Column({ type: 'varchar', name: 'email', length: 100, nullable: true, comment: '邮箱' })
  email?: string | null;

  @Column({ type: 'varchar', name: 'gender', length: 20, nullable: true, comment: '性别' })
  gender?: string | null;

  @Column({ type: 'varchar', name: 'avatar_url', length: 500, nullable: true, comment: '头像地址' })
  avatarUrl?: string | null;

  @Column({ type: 'varchar', name: 'background_url', length: 500, nullable: true, comment: '背景图地址' })
  backgroundUrl?: string | null;

  @Column({ type: 'longtext', name: 'honor_remark', nullable: true, comment: '荣誉简介' })
  honorRemark?: string | null;

  @Column({ type: 'varchar', name: 'graduation_school', length: 255, nullable: true, comment: '毕业院校' })
  graduationSchool?: string | null;

  @Column({ type: 'varchar', name: 'study_area', length: 255, nullable: true, comment: '留学地区' })
  studyArea?: string | null;

  @Column({ type: 'longtext', name: 'company_remark', nullable: true, comment: '企业信息' })
  companyRemark?: string | null;

  @Column({ type: 'longtext', name: 'job_remark', nullable: true, comment: '岗位信息' })
  jobRemark?: string | null;

  @Column({ type: 'longtext', name: 'social_post_remark', nullable: true, comment: '社会职务' })
  socialPostRemark?: string | null;

  @Column({ type: 'int', name: 'sort_number', default: 0, comment: '排序值' })
  sortNumber: number;

  @Column({ type: 'int', name: 'status', default: 0, comment: '状态' })
  status: number;

  @Column({ type: 'varchar', name: 'create_by', length: 100, nullable: true })
  createBy?: string | null;

  @Column({ type: 'datetime', name: 'create_time', nullable: true })
  createTime?: Date | null;

  @Column({ type: 'varchar', name: 'update_by', length: 100, nullable: true })
  updateBy?: string | null;

  @Column({ type: 'datetime', name: 'update_time', nullable: true })
  updateTime?: Date | null;
}
