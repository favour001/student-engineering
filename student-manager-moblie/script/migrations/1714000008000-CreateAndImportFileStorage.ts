import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAndImportFileStorage1714000008000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`file_storage\` (
        \`file_key\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'UUID',
        \`original_file_name\` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '原文件名',
        \`hash_val\` varchar(320) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'hash值',
        \`file_type\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '文件类型(IMG,AUDIO,VIDEO,DOC)',
        \`file_path\` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '文件path',
        \`file_size\` bigint DEFAULT NULL COMMENT '文件大小',
        \`file_ext\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '文件后缀',
        \`content_type\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '媒体类型',
        \`store_way\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '存储方式',
        \`store_region\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '存储区域',
        \`is_temp\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '临时存储',
        \`expire_time\` bigint DEFAULT NULL COMMENT '过期时间 超时删除',
        \`db_path\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'db关系路径(db/table/field)',
        \`env\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '环境(local/dev/prod)',
        \`application\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '应用名称',
        \`bucket\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '存储空间',
        \`extra\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '扩展参数',
        \`remark\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
        \`cre_sb\` bigint DEFAULT NULL COMMENT '创建人',
        \`cre_time\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
        PRIMARY KEY (\`file_key\`) USING BTREE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='file_storage '
    `);

    await queryRunner.query(`
      INSERT INTO \`file_storage\` (
        \`file_key\`, \`original_file_name\`, \`hash_val\`, \`file_type\`, \`file_path\`,
        \`file_size\`, \`file_ext\`, \`content_type\`, \`store_way\`, \`store_region\`,
        \`is_temp\`, \`expire_time\`, \`db_path\`, \`env\`, \`application\`,
        \`bucket\`, \`extra\`, \`remark\`, \`cre_sb\`, \`cre_time\`
      )
      SELECT
        legacy.\`file_key\`, legacy.\`original_file_name\`, legacy.\`hash_val\`, legacy.\`file_type\`, legacy.\`file_path\`,
        legacy.\`file_size\`, legacy.\`file_ext\`, legacy.\`content_type\`, legacy.\`store_way\`, legacy.\`store_region\`,
        legacy.\`is_temp\`, legacy.\`expire_time\`, legacy.\`db_path\`, legacy.\`env\`, legacy.\`application\`,
        legacy.\`bucket\`, legacy.\`extra\`, legacy.\`remark\`, legacy.\`cre_sb\`, legacy.\`cre_time\`
      FROM \`liuxie\`.\`file_storage\` legacy
      WHERE NOT EXISTS (
        SELECT 1
        FROM \`file_storage\` current_file
        WHERE current_file.\`file_key\` = legacy.\`file_key\`
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE current_file
      FROM \`file_storage\` current_file
      INNER JOIN \`liuxie\`.\`file_storage\` legacy
        ON legacy.\`file_key\` = current_file.\`file_key\`
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS \`file_storage\`
    `);
  }
}
