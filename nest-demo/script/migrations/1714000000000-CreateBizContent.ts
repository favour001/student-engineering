import { Migration } from '../interfaces/migration.interface';

export class CreateBizContent1714000000000 implements Migration {
  name = 'CreateBizContent';
  timestamp = 1714000000000;

  async up(queryRunner: any): Promise<void> {
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

  async down(queryRunner: any): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `biz_content`');
  }
}
