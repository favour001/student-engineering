import { MigrationInterface, QueryRunner } from 'typeorm';

type ColumnPatch = {
  table: string;
  column: string;
  definition: string;
};

const COLUMN_PATCHES: ColumnPatch[] = [
  { table: 'lx_activity', column: 'contact_mobile', definition: 'varchar(255) NULL' },
  { table: 'lx_activity', column: 'contact_name', definition: 'varchar(255) NULL' },
  { table: 'lx_activity', column: 'label_name', definition: 'varchar(255) NULL' },
  { table: 'lx_activity', column: 'status', definition: 'varchar(64) NULL' },
  { table: 'lx_article', column: 'type', definition: 'varchar(255) NULL' },
  { table: 'lx_card', column: 'create_by', definition: 'varchar(255) NULL' },
  { table: 'lx_card', column: 'status', definition: 'varchar(25) NULL' },
  { table: 'lx_card', column: 'use_status', definition: 'varchar(255) NULL' },
  { table: 'lx_information', column: 'content_type', definition: 'varchar(255) NULL' },
  { table: 'lx_information', column: 'title', definition: 'varchar(255) NOT NULL' },
  { table: 'lx_information', column: 'type', definition: 'varchar(255) NULL' },
  { table: 'lx_merchant', column: 'cover_url', definition: 'varchar(5000) NULL' },
  { table: 'lx_merchant', column: 'title', definition: 'varchar(255) NOT NULL' },
  { table: 'lx_merchant_user', column: 'create_by', definition: 'varchar(255) NULL' },
  { table: 'lx_tweet', column: 'tweet_title', definition: 'varchar(900) NOT NULL' },
  { table: 'lx_user_manager', column: 'mobile', definition: 'varchar(64) NULL' },
  { table: 'lx_user_notice', column: 'title', definition: 'varchar(900) NOT NULL' },
  { table: 'lx_video', column: 'feeld_id', definition: 'varchar(500) NULL' },
  { table: 'lx_video', column: 'finder_user_name', definition: 'varchar(500) NULL' },
  { table: 'lx_welfare', column: 'discount', definition: 'varchar(255) NULL' },
  { table: 'lx_welfare', column: 'discount_type', definition: 'varchar(255) NULL' },
  { table: 'lx_wxuser', column: 'certificate', definition: 'varchar(1055) NULL' },
  { table: 'lx_wxuser', column: 'company_name', definition: 'varchar(255) NULL' },
  { table: 'lx_wxuser', column: 'company_post', definition: 'varchar(255) NULL' },
  { table: 'lx_wxuser', column: 'email', definition: 'varchar(255) NULL' },
  { table: 'lx_wxuser', column: 'gender', definition: 'varchar(64) NULL' },
  { table: 'lx_wxuser', column: 'jiguan', definition: 'varchar(255) NULL' },
  { table: 'lx_wxuser', column: 'liuxue_guo', definition: 'varchar(255) NULL' },
  { table: 'lx_wxuser', column: 'liuxue_school', definition: 'varchar(255) NULL' },
  { table: 'lx_wxuser', column: 'major', definition: 'varchar(255) NULL' },
  { table: 'lx_wxuser', column: 'mobile', definition: 'varchar(64) NULL' },
  { table: 'lx_wxuser', column: 'nick_name', definition: 'varchar(255) NULL' },
  { table: 'lx_wxuser', column: 'post', definition: 'varchar(255) NULL' },
];

export class WidenStudentBusinessColumnsToMatchLegacy1714000005000
  implements MigrationInterface
{
  name = 'WidenStudentBusinessColumnsToMatchLegacy';
  timestamp = 1714000005000;

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const patch of COLUMN_PATCHES) {
      await queryRunner.query(
        `
          ALTER TABLE \`${patch.table}\`
          MODIFY COLUMN \`${patch.column}\` ${patch.definition}
        `,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration intentionally widens columns for legacy compatibility.
  }
}
