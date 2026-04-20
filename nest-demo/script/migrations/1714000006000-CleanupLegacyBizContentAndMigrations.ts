import { Migration } from '../interfaces/migration.interface';

export class CleanupLegacyBizContentAndMigrations1714000006000
  implements Migration
{
  name = 'CleanupLegacyBizContentAndMigrations';
  timestamp = 1714000006000;

  public async up(queryRunner: any): Promise<void> {
    // Keep the earliest record for each migration and remove later duplicates.
    await queryRunner.query(`
      DELETE m1
      FROM migrations m1
      INNER JOIN migrations m2
        ON m1.timestamp = m2.timestamp
       AND m1.name = m2.name
       AND m1.id > m2.id
    `);

    const existingIndex = await queryRunner.query(`
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'migrations'
        AND index_name = 'UQ_migrations_timestamp_name'
      LIMIT 1
    `);

    if (existingIndex.length === 0) {
      await queryRunner.query(`
        ALTER TABLE migrations
        ADD UNIQUE INDEX UQ_migrations_timestamp_name (timestamp, name)
      `);
    }

    const bizContentTables = await queryRunner.query(`
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'biz_content'
      LIMIT 1
    `);

    if (bizContentTables.length > 0) {
      const rows = await queryRunner.query(
        'SELECT COUNT(*) AS count FROM biz_content',
      );
      const count = Number(rows[0]?.count ?? 0);

      if (count === 0) {
        await queryRunner.query('DROP TABLE IF EXISTS `biz_content`');
        await queryRunner.query(
          'DELETE FROM migrations WHERE timestamp = ? AND name = ?',
          [1714000000000, 'CreateBizContent'],
        );
      }
    }
  }

  public async down(queryRunner: any): Promise<void> {
    const existingIndex = await queryRunner.query(`
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'migrations'
        AND index_name = 'UQ_migrations_timestamp_name'
      LIMIT 1
    `);

    if (existingIndex.length > 0) {
      await queryRunner.query(`
        ALTER TABLE migrations
        DROP INDEX UQ_migrations_timestamp_name
      `);
    }

    const bizContentTables = await queryRunner.query(`
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'biz_content'
      LIMIT 1
    `);

    if (bizContentTables.length === 0) {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS \`biz_content\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`category\` varchar(64) NOT NULL COMMENT '业务分类',
          \`title\` varchar(200) NOT NULL COMMENT '标题',
          \`sub_title\` varchar(200) NULL COMMENT '副标题',
          \`summary\` varchar(500) NULL COMMENT '摘要',
          \`content\` longtext NULL COMMENT '正文内容',
          \`cover_image\` varchar(500) NULL COMMENT '封面图',
          \`external_url\` varchar(500) NULL COMMENT '外链地址',
          \`source\` varchar(100) NULL COMMENT '来源',
          \`author\` varchar(100) NULL COMMENT '作者',
          \`tags\` varchar(500) NULL COMMENT '标签',
          \`sort_number\` int NOT NULL DEFAULT 0 COMMENT '排序',
          \`status\` tinyint NOT NULL DEFAULT 0 COMMENT '状态 0启用 1禁用',
          \`is_top\` tinyint NOT NULL DEFAULT 0 COMMENT '是否置顶',
          \`published_at\` datetime NULL COMMENT '发布时间',
          \`create_by\` varchar(100) NULL,
          \`create_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`update_by\` varchar(100) NULL,
          \`update_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`),
          INDEX \`IDX_biz_content_category\` (\`category\`),
          INDEX \`IDX_biz_content_status\` (\`status\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }

    await queryRunner.query(
      `
        INSERT INTO migrations (timestamp, name)
        SELECT ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM migrations WHERE timestamp = ? AND name = ?
        )
      `,
      [1714000000000, 'CreateBizContent', 1714000000000, 'CreateBizContent'],
    );
  }
}
