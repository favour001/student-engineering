import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_card' })
export class LxCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'card_id', comment: '会员卡/福利ID' })
  cardId: string;

  @Column({ type: 'bigint', name: 'user_id', comment: '微信用户ID' })
  userId: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '类型' })
  type?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '状态' })
  status?: string | null;

  @Column({ type: 'varchar', name: 'use_status', length: 20, nullable: true, comment: '使用状态' })
  useStatus?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'varchar', name: 'create_by', length: 100, nullable: true })
  createBy?: string | null;
}
