import { Migration } from '../interfaces/migration.interface';

export class CreateBizContent1714000000000 implements Migration {
  name = 'CreateBizContent';
  timestamp = 1714000000000;

  async up(queryRunner: any): Promise<void> {
    // Legacy migration kept only to preserve history; biz_content is no longer used.
  }

  async down(queryRunner: any): Promise<void> {
    // No-op: the legacy biz_content table is managed by cleanup migration.
  }
}
