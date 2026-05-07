import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitMemberStyleOrgRelations1714000019000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`lx_member_award\` (
        \`id\` BIGINT NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`sort_number\` INT NOT NULL DEFAULT 0,
        \`status\` INT NOT NULL DEFAULT 0,
        \`create_time\` DATETIME NULL,
        \`update_time\` DATETIME NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`lx_member_style_department\` (
        \`member_style_id\` BIGINT NOT NULL,
        \`department_id\` BIGINT NOT NULL,
        PRIMARY KEY (\`member_style_id\`, \`department_id\`),
        KEY \`IDX_member_style_department_department\` (\`department_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`lx_member_style_post\` (
        \`member_style_id\` BIGINT NOT NULL,
        \`post_id\` BIGINT NOT NULL,
        PRIMARY KEY (\`member_style_id\`, \`post_id\`),
        KEY \`IDX_member_style_post_post\` (\`post_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`lx_member_style_award\` (
        \`member_style_id\` BIGINT NOT NULL,
        \`award_id\` BIGINT NOT NULL,
        PRIMARY KEY (\`member_style_id\`, \`award_id\`),
        KEY \`IDX_member_style_award_award\` (\`award_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query('DELETE FROM `lx_member_style_department`');
    await queryRunner.query('DELETE FROM `lx_member_style_post`');
    await queryRunner.query('DELETE FROM `lx_member_style_award`');
    await queryRunner.query('DELETE FROM `lx_member_award`');

    await queryRunner.query(`
      INSERT INTO \`lx_member_award\` (\`id\`, \`name\`, \`sort_number\`, \`status\`, \`create_time\`, \`update_time\`)
      SELECT \`id\`, \`name\`, COALESCE(\`sort_number\`, 0), COALESCE(\`status\`, 0), \`create_time\`, \`update_time\`
      FROM \`sys_post\`
      WHERE \`name\` LIKE '%奖%'
    `);

    await queryRunner.query(`
      INSERT INTO \`lx_member_style_department\` (\`member_style_id\`, \`department_id\`)
      SELECT DISTINCT member.\`id\`, relation.\`department_id\`
      FROM \`lx_member_style\` member
      JOIN \`sys_user_department\` relation ON relation.\`user_id\` = member.\`legacy_user_id\`
      WHERE member.\`legacy_user_id\` IS NOT NULL
    `);

    await queryRunner.query(`
      INSERT INTO \`lx_member_style_post\` (\`member_style_id\`, \`post_id\`)
      SELECT DISTINCT member.\`id\`, relation.\`post_id\`
      FROM \`lx_member_style\` member
      JOIN \`sys_user_post\` relation ON relation.\`user_id\` = member.\`legacy_user_id\`
      JOIN \`sys_post\` post ON post.\`id\` = relation.\`post_id\`
      WHERE member.\`legacy_user_id\` IS NOT NULL
        AND post.\`name\` NOT LIKE '%奖%'
    `);

    await queryRunner.query(`
      INSERT INTO \`lx_member_style_award\` (\`member_style_id\`, \`award_id\`)
      SELECT DISTINCT member.\`id\`, relation.\`post_id\`
      FROM \`lx_member_style\` member
      JOIN \`sys_user_post\` relation ON relation.\`user_id\` = member.\`legacy_user_id\`
      JOIN \`sys_post\` post ON post.\`id\` = relation.\`post_id\`
      WHERE member.\`legacy_user_id\` IS NOT NULL
        AND post.\`name\` LIKE '%奖%'
    `);

    await queryRunner.query('SET FOREIGN_KEY_CHECKS=0');
    await queryRunner.query('DELETE FROM `sys_user_department`');
    await queryRunner.query('DELETE FROM `sys_user_post`');
    await queryRunner.query('SET FOREIGN_KEY_CHECKS=1');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM `lx_member_style_department`');
    await queryRunner.query('DELETE FROM `lx_member_style_post`');
    await queryRunner.query('DELETE FROM `lx_member_style_award`');
    await queryRunner.query('DELETE FROM `lx_member_award`');
  }
}
