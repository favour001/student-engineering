import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'file_storage' })
export class FileStorage {
  @PrimaryColumn({ type: 'varchar', length: 32, name: 'file_key' })
  fileKey: string;

  @Column({ type: 'varchar', length: 200, name: 'original_file_name', nullable: true })
  originalFileName?: string | null;

  @Column({ type: 'varchar', length: 320, name: 'hash_val', nullable: true })
  hashVal?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'file_type', nullable: true })
  fileType?: string | null;

  @Column({ type: 'varchar', length: 300, name: 'file_path', nullable: true })
  filePath?: string | null;

  @Column({ type: 'bigint', name: 'file_size', nullable: true })
  fileSize?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'file_ext', nullable: true })
  fileExt?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'content_type', nullable: true })
  contentType?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'store_way', nullable: true })
  storeWay?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'store_region', nullable: true })
  storeRegion?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'is_temp', nullable: true, default: '0' })
  isTemp?: string | null;

  @Column({ type: 'bigint', name: 'expire_time', nullable: true })
  expireTime?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'db_path', nullable: true })
  dbPath?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'env', nullable: true })
  env?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'application', nullable: true })
  application?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'bucket', nullable: true })
  bucket?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'extra', nullable: true })
  extra?: string | null;

  @Column({ type: 'varchar', length: 32, name: 'remark', nullable: true })
  remark?: string | null;

  @Column({ type: 'bigint', name: 'cre_sb', nullable: true })
  creSb?: string | null;

  @Column({ type: 'datetime', name: 'cre_time', nullable: true })
  creTime?: Date | null;
}
