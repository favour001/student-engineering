import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'app_refresh_token' })
@Index(['token'])
@Index(['userId'])
export class AppRefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, unique: true })
  token: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'expires_time', type: 'datetime' })
  expiresTime: Date;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @Column({ name: 'openid', type: 'varchar', length: 255, nullable: true })
  openid?: string | null;

  @Column({ name: 'device_info', type: 'varchar', length: 1000, nullable: true })
  deviceInfo?: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress?: string | null;

  @CreateDateColumn({ name: 'created_time' })
  createdTime: Date;

  @Column({ name: 'revoked_time', type: 'datetime', nullable: true })
  revokedTime?: Date | null;
}
