import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateMemberStyleAndImportLegacyData1714000007000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasMemberStyleTable = await queryRunner.hasTable('lx_member_style');

    if (!hasMemberStyleTable) {
      await queryRunner.createTable(
        new Table({
          name: 'lx_member_style',
          columns: [
            { name: 'id', type: 'bigint', isPrimary: true },
            { name: 'legacy_user_id', type: 'bigint', isNullable: true, isUnique: true },
            { name: 'order_number', type: 'bigint', isNullable: true },
            { name: 'user_name', type: 'varchar', length: '100' },
            { name: 'display_name', type: 'varchar', length: '100', isNullable: true },
            { name: 'job_title', type: 'varchar', length: '128', isNullable: true },
            { name: 'member_rank', type: 'varchar', length: '64', isNullable: true },
            { name: 'joined_at', type: 'datetime', isNullable: true },
            { name: 'mobile', type: 'varchar', length: '32', isNullable: true },
            { name: 'email', type: 'varchar', length: '100', isNullable: true },
            { name: 'gender', type: 'varchar', length: '20', isNullable: true },
            { name: 'avatar_url', type: 'varchar', length: '500', isNullable: true },
            { name: 'background_url', type: 'varchar', length: '500', isNullable: true },
            { name: 'honor_remark', type: 'longtext', isNullable: true },
            { name: 'graduation_school', type: 'varchar', length: '255', isNullable: true },
            { name: 'study_area', type: 'varchar', length: '255', isNullable: true },
            { name: 'company_remark', type: 'longtext', isNullable: true },
            { name: 'job_remark', type: 'longtext', isNullable: true },
            { name: 'social_post_remark', type: 'longtext', isNullable: true },
            { name: 'sort_number', type: 'int', default: '0' },
            { name: 'status', type: 'int', default: '0' },
            { name: 'create_by', type: 'varchar', length: '100', isNullable: true },
            { name: 'create_time', type: 'datetime', isNullable: true },
            { name: 'update_by', type: 'varchar', length: '100', isNullable: true },
            { name: 'update_time', type: 'datetime', isNullable: true },
          ],
        }),
        true,
      );

      await queryRunner.createIndex(
        'lx_member_style',
        new TableIndex({
          name: 'IDX_lx_member_style_sort_status',
          columnNames: ['sort_number', 'status'],
        }),
      );
    }

    await queryRunner.query(`
      INSERT INTO \`sys_post\` (
        \`id\`, \`name\`, \`code\`, \`sort_number\`, \`status\`, \`describe\`,
        \`create_by\`, \`create_time\`, \`update_by\`, \`update_time\`
      )
      SELECT
        legacy.\`id\`,
        legacy.\`post_name\`,
        legacy.\`post_code\`,
        legacy.\`post_sort\`,
        CASE WHEN legacy.\`status\` = '0' THEN 0 ELSE 1 END,
        NULLIF(legacy.\`remark\`, ''),
        NULLIF(legacy.\`create_by\`, ''),
        legacy.\`create_time\`,
        NULLIF(legacy.\`update_by\`, ''),
        legacy.\`update_time\`
      FROM \`liuxie\`.\`sys_post\` legacy
      WHERE NOT EXISTS (
        SELECT 1
        FROM \`sys_post\` current_post
        WHERE current_post.\`code\` COLLATE utf8mb4_unicode_ci = legacy.\`post_code\` COLLATE utf8mb4_unicode_ci
      )
    `);

    await queryRunner.query(`
      INSERT INTO \`sys_department\` (
        \`id\`, \`name\`, \`code\`, \`sort_number\`, \`leader\`, \`phone\`, \`email\`,
        \`address\`, \`parent_id\`, \`status\`, \`describe\`,
        \`create_by\`, \`create_time\`, \`update_by\`, \`update_time\`
      )
      SELECT
        legacy.\`id\`,
        legacy.\`dept_name\`,
        CONCAT('legacy-dept-', legacy.\`id\`),
        COALESCE(legacy.\`order_num\`, 0),
        legacy.\`leader\`,
        legacy.\`phone\`,
        legacy.\`email\`,
        NULL,
        COALESCE(legacy.\`parent_id\`, 0),
        CASE WHEN legacy.\`status\` = '0' THEN 0 ELSE 1 END,
        NULL,
        NULLIF(legacy.\`create_by\`, ''),
        legacy.\`create_time\`,
        NULLIF(legacy.\`update_by\`, ''),
        legacy.\`update_time\`
      FROM \`liuxie\`.\`sys_dept\` legacy
      WHERE NOT EXISTS (
        SELECT 1
        FROM \`sys_department\` current_dept
        WHERE current_dept.\`code\` COLLATE utf8mb4_unicode_ci = CONCAT('legacy-dept-', legacy.\`id\`) COLLATE utf8mb4_unicode_ci
      )
    `);

    await queryRunner.query(`
      INSERT INTO \`lx_member_style\` (
        \`id\`, \`legacy_user_id\`, \`order_number\`, \`user_name\`, \`display_name\`,
        \`job_title\`, \`member_rank\`, \`joined_at\`, \`mobile\`, \`email\`, \`gender\`,
        \`avatar_url\`, \`background_url\`, \`honor_remark\`, \`graduation_school\`,
        \`study_area\`, \`company_remark\`, \`job_remark\`, \`social_post_remark\`,
        \`sort_number\`, \`status\`, \`create_by\`, \`create_time\`, \`update_by\`, \`update_time\`
      )
      SELECT
        legacy.\`id\`,
        legacy.\`id\`,
        legacy.\`order_number\`,
        legacy.\`user_name\`,
        NULLIF(legacy.\`nick_name\`, ''),
        NULLIF(legacy.\`job_name\`, ''),
        NULLIF(legacy.\`user_sort\`, ''),
        legacy.\`create_time\`,
        NULLIF(legacy.\`phonenumber\`, ''),
        NULLIF(legacy.\`email\`, ''),
        CASE legacy.\`sex\`
          WHEN '1' THEN '1'
          WHEN '2' THEN '2'
          ELSE NULL
        END,
        NULLIF(legacy.\`avatar\`, ''),
        NULLIF(legacy.\`background_url\`, ''),
        legacy.\`honor_remark\`,
        NULLIF(legacy.\`graduation_school\`, ''),
        NULLIF(legacy.\`study_area\`, ''),
        legacy.\`company_remark\`,
        legacy.\`job_remark\`,
        legacy.\`society_job_remark\`,
        COALESCE(legacy.\`order_number\`, 0),
        CASE WHEN legacy.\`status\` = '0' THEN 0 ELSE 1 END,
        NULLIF(legacy.\`create_by\`, ''),
        legacy.\`create_time\`,
        NULLIF(legacy.\`update_by\`, ''),
        legacy.\`update_time\`
      FROM \`liuxie\`.\`sys_user\` legacy
      WHERE legacy.\`user_name\` IS NOT NULL
        AND legacy.\`user_name\` <> ''
        AND legacy.\`user_name\` <> 'admin'
        AND legacy.\`del_flag\` = '0'
        AND NOT EXISTS (
          SELECT 1 FROM \`lx_member_style\` current_member WHERE current_member.\`legacy_user_id\` = legacy.\`id\`
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`lx_member_style\`
      WHERE \`legacy_user_id\` IS NOT NULL
    `);

    await queryRunner.query(`
      DELETE FROM \`sys_department\`
      WHERE \`code\` LIKE 'legacy-dept-%'
    `);

    await queryRunner.query(`
      DELETE FROM \`sys_post\`
      WHERE \`id\` IN (SELECT legacy.\`id\` FROM \`liuxie\`.\`sys_post\` legacy)
    `);

    const hasMemberStyleTable = await queryRunner.hasTable('lx_member_style');
    if (hasMemberStyleTable) {
      await queryRunner.dropTable('lx_member_style', true);
    }
  }
}
