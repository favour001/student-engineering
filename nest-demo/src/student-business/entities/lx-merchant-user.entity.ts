import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_merchant_user' })
export class LxMerchantUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'merchant_id', comment: '商家ID' })
  merchantId: string;

  @Column({ type: 'bigint', name: 'user_id', comment: '微信用户ID' })
  userId: string;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'varchar', name: 'create_by', length: 100, nullable: true })
  createBy?: string | null;
}
