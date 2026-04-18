import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { SysUser } from "../../sys-user/entities/sys-user.entity";

@Entity('refresh_token')
@Index(['token'])
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, unique: true })
  token: string;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => SysUser)
  @JoinColumn({ name: 'user_id' })
  user: SysUser;

  @Column({ name: 'expires_time', type: 'datetime' })
  expiresTime: Date;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @Column({ name: 'device_info', type: 'varchar', length: 1000, nullable: true, comment: '设备信息' })
  deviceInfo: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true, comment: 'IP地址' })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_time' })
  createdTime: Date;

  @Column({ name: 'revoked_time', type: 'datetime', nullable: true })
  revokedTime: Date;

  @Column({ name: 'revoke_reason', type: 'varchar', length: 100, nullable: true, comment: '吊销原因' })
  revokeReason: string;
}