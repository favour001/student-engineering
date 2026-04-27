import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppRefreshToken1714000010000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`app_refresh_token\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`token\` varchar(500) NOT NULL,
        \`user_id\` bigint NOT NULL,
        \`expires_time\` datetime NOT NULL,
        \`is_revoked\` tinyint NOT NULL DEFAULT 0,
        \`openid\` varchar(255) NULL,
        \`device_info\` varchar(1000) NULL,
        \`ip_address\` varchar(50) NULL,
        \`created_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`revoked_time\` datetime NULL,
        UNIQUE KEY \`IDX_app_refresh_token_token_unique\` (\`token\`),
        KEY \`IDX_app_refresh_token_token\` (\`token\`),
        KEY \`IDX_app_refresh_token_user_id\` (\`user_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `app_refresh_token`');
  }
}
