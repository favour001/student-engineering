import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class RepairMemberStyleOrgData1714000012000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasMemberStyleTable = await queryRunner.hasTable('lx_member_style');
    if (!hasMemberStyleTable) return;

    const memberStyleTable = await queryRunner.getTable('lx_member_style');
    if (!memberStyleTable?.findColumnByName('post_id')) {
      await queryRunner.addColumn(
        'lx_member_style',
        new TableColumn({
          name: 'post_id',
          type: 'bigint',
          isNullable: true,
          comment: '系统岗位ID',
        }),
      );
    }

    if (!memberStyleTable?.findColumnByName('dept_id')) {
      await queryRunner.addColumn(
        'lx_member_style',
        new TableColumn({
          name: 'dept_id',
          type: 'bigint',
          isNullable: true,
          comment: '系统部门ID',
        }),
      );
    }

    const refreshedMemberStyleTable = await queryRunner.getTable('lx_member_style');
    if (!refreshedMemberStyleTable?.indices.some((index) => index.name === 'IDX_lx_member_style_post_dept')) {
      await queryRunner.createIndex(
        'lx_member_style',
        new TableIndex({
          name: 'IDX_lx_member_style_post_dept',
          columnNames: ['post_id', 'dept_id'],
        }),
      );
    }

    await this.importLegacyDepartments(queryRunner);
    await this.importLegacyPosts(queryRunner);
    await this.backfillMemberOrgRefs(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasMemberStyleTable = await queryRunner.hasTable('lx_member_style');
    if (!hasMemberStyleTable) return;

    await queryRunner.query('UPDATE `lx_member_style` SET `post_id` = NULL, `dept_id` = NULL');
  }

  private async importLegacyDepartments(queryRunner: QueryRunner) {
    await queryRunner.query(`
      INSERT INTO \`sys_department\` (
        \`id\`, \`name\`, \`code\`, \`sort_number\`, \`leader\`, \`phone\`, \`email\`,
        \`address\`, \`parent_id\`, \`status\`, \`describe\`, \`create_time\`,
        \`update_time\`, \`create_by\`, \`update_by\`
      )
      SELECT
        legacy.\`id\`,
        legacy.\`dept_name\`,
        CONCAT('legacy_dept_', legacy.\`id\`),
        COALESCE(legacy.\`order_num\`, 0),
        legacy.\`leader\`,
        legacy.\`phone\`,
        legacy.\`email\`,
        NULL,
        legacy.\`parent_id\`,
        CASE WHEN legacy.\`status\` = '0' AND legacy.\`del_flag\` = '0' THEN 0 ELSE 1 END,
        NULL,
        COALESCE(legacy.\`create_time\`, NOW()),
        COALESCE(legacy.\`update_time\`, legacy.\`create_time\`, NOW()),
        legacy.\`create_by\`,
        legacy.\`update_by\`
      FROM \`liuxie\`.\`sys_dept\` legacy
      WHERE legacy.\`dept_name\` IS NOT NULL
        AND legacy.\`dept_name\` <> ''
      ON DUPLICATE KEY UPDATE
        \`name\` = VALUES(\`name\`),
        \`sort_number\` = VALUES(\`sort_number\`),
        \`leader\` = VALUES(\`leader\`),
        \`phone\` = VALUES(\`phone\`),
        \`email\` = VALUES(\`email\`),
        \`parent_id\` = VALUES(\`parent_id\`),
        \`status\` = VALUES(\`status\`),
        \`update_time\` = VALUES(\`update_time\`),
        \`update_by\` = VALUES(\`update_by\`)
    `);
  }

  private async importLegacyPosts(queryRunner: QueryRunner) {
    await queryRunner.query(`
      INSERT INTO \`sys_post\` (
        \`id\`, \`name\`, \`code\`, \`sort_number\`, \`status\`, \`describe\`,
        \`create_time\`, \`update_time\`, \`create_by\`, \`update_by\`
      )
      SELECT
        legacy.\`id\`,
        legacy.\`post_name\`,
        CASE
          WHEN legacy.\`post_code\` IS NULL OR legacy.\`post_code\` = '' THEN CONCAT('legacy_post_', legacy.\`id\`)
          ELSE legacy.\`post_code\`
        END,
        COALESCE(legacy.\`post_sort\`, 0),
        CASE WHEN legacy.\`status\` = '0' THEN 0 ELSE 1 END,
        legacy.\`remark\`,
        COALESCE(legacy.\`create_time\`, NOW()),
        COALESCE(legacy.\`update_time\`, legacy.\`create_time\`, NOW()),
        legacy.\`create_by\`,
        legacy.\`update_by\`
      FROM \`liuxie\`.\`sys_post\` legacy
      WHERE legacy.\`post_name\` IS NOT NULL
        AND legacy.\`post_name\` <> ''
      ON DUPLICATE KEY UPDATE
        \`name\` = VALUES(\`name\`),
        \`sort_number\` = VALUES(\`sort_number\`),
        \`status\` = VALUES(\`status\`),
        \`describe\` = VALUES(\`describe\`),
        \`update_time\` = VALUES(\`update_time\`),
        \`update_by\` = VALUES(\`update_by\`)
    `);
  }

  private async backfillMemberOrgRefs(queryRunner: QueryRunner) {
    await queryRunner.query(`
      UPDATE \`lx_member_style\` member
      LEFT JOIN (
        SELECT user_id, MIN(post_id) AS post_id
        FROM \`liuxie\`.\`sys_user_post\`
        GROUP BY user_id
      ) user_post ON user_post.user_id = member.\`legacy_user_id\`
      LEFT JOIN (
        SELECT
          user_id,
          COALESCE(
            MIN(CASE WHEN parent_id <> 0 THEN dept_id END),
            MIN(dept_id)
          ) AS dept_id
        FROM \`liuxie\`.\`sys_user_dept\`
        GROUP BY user_id
      ) user_dept ON user_dept.user_id = member.\`legacy_user_id\`
      SET
        member.\`post_id\` = COALESCE(member.\`post_id\`, user_post.post_id),
        member.\`dept_id\` = COALESCE(member.\`dept_id\`, user_dept.dept_id)
      WHERE member.\`legacy_user_id\` IS NOT NULL
    `);
  }
}
