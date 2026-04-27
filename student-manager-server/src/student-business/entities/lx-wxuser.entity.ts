import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_wxuser' })
export class LxWxuser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'user_name', length: 100, nullable: true, comment: '用户昵称' })
  userName?: string | null;

  @Column({ type: 'varchar', name: 'user_english_name', length: 100, nullable: true, comment: '英文名' })
  userEnglishName?: string | null;

  @Column({ type: 'datetime', name: 'reg_date', nullable: true, comment: '注册日期' })
  regDate?: Date | null;

  @Column({ type: 'varchar', name: 'order', length: 100, nullable: true, comment: '会员编号' })
  order?: string | null;

  @Column({ type: 'varchar', name: 'liuxue_guo', length: 100, nullable: true, comment: '留学国家' })
  liuxueGuo?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '手机号' })
  mobile?: string | null;

  @Column({ type: 'varchar', name: 'liuxue_school', length: 200, nullable: true, comment: '留学学校' })
  liuxueSchool?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '专业/证书' })
  major?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '证书' })
  certificate?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '性别' })
  gender?: string | null;

  @Column({ type: 'varchar', name: 'company_name', length: 200, nullable: true, comment: '单位名称' })
  companyName?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '是否会员' })
  vip?: string | null;

  @Column({ type: 'varchar', name: 'company_post', length: 100, nullable: true, comment: '单位职位' })
  companyPost?: string | null;

  @Column({ type: 'varchar', name: 'company_address', length: 255, nullable: true, comment: '单位地址' })
  companyAddress?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '审核状态' })
  status?: string | null;

  @Column({ type: 'text', nullable: true, comment: '会员简介' })
  remark?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '社会职务' })
  post?: string | null;

  @Column({ type: 'varchar', name: 'nick_name', length: 100, nullable: true, comment: '微信昵称' })
  nickName?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;

  @Column({ type: 'varchar', name: 'avater_url', length: 500, nullable: true, comment: '头像地址' })
  avaterUrl?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '邮箱' })
  email?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '籍贯' })
  jiguan?: string | null;

  @Column({ type: 'datetime', nullable: true, comment: '生日' })
  birthday?: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '微信OpenID' })
  wxopenid?: string | null;

  @Column({ type: 'longtext', nullable: true, comment: '档案信息' })
  archives?: string | null;
}
