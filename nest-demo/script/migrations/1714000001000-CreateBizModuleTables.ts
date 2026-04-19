import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBizModuleTables1714000001000 implements MigrationInterface {
  name = 'CreateBizModuleTables';
  timestamp = 1714000001000;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lx_user_manager',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_name', type: 'varchar', length: '100' },
          { name: 'avater_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'reg_date', type: 'datetime', isNullable: true },
          { name: 'mobile', type: 'varchar', length: '50', isNullable: true },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_xiehui',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'avater_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'update_time', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_ruhui',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'avater_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'update_time', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_user_notice',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'releases', type: 'tinyint', default: 0 },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_article',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'order_number', type: 'int', default: 0 },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'article_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'type', type: 'varchar', length: '100', isNullable: true },
          { name: 'content_type', type: 'longtext', isNullable: true },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_tweet',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'tweet_title', type: 'varchar', length: '200' },
          { name: 'tweet_type', type: 'varchar', length: '100', isNullable: true },
          { name: 'tweet_content', type: 'longtext', isNullable: true },
          { name: 'tweet_img', type: 'varchar', length: '500', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_information',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'order_number', type: 'int', default: 0 },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'information_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'information_content', type: 'longtext', isNullable: true },
          { name: 'type', type: 'varchar', length: '100', isNullable: true },
          { name: 'content_type', type: 'varchar', length: '100', isNullable: true },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_user_banner',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'avater_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'releases', type: 'tinyint', default: 0 },
          { name: 'point_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_user_jin',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'avater_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'releases', type: 'tinyint', default: 0 },
          { name: 'point_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_wxuser',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'user_english_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'reg_date', type: 'datetime', isNullable: true },
          { name: 'order', type: 'varchar', length: '100', isNullable: true },
          { name: 'liuxue_guo', type: 'varchar', length: '100', isNullable: true },
          { name: 'mobile', type: 'varchar', length: '50', isNullable: true },
          { name: 'liuxue_school', type: 'varchar', length: '200', isNullable: true },
          { name: 'major', type: 'varchar', length: '200', isNullable: true },
          { name: 'certificate', type: 'varchar', length: '200', isNullable: true },
          { name: 'gender', type: 'varchar', length: '20', isNullable: true },
          { name: 'company_name', type: 'varchar', length: '200', isNullable: true },
          { name: 'vip', type: 'varchar', length: '20', isNullable: true },
          { name: 'company_post', type: 'varchar', length: '100', isNullable: true },
          { name: 'company_address', type: 'varchar', length: '255', isNullable: true },
          { name: 'status', type: 'varchar', length: '50', isNullable: true },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'post', type: 'varchar', length: '100', isNullable: true },
          { name: 'nick_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
          { name: 'avater_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'email', type: 'varchar', length: '100', isNullable: true },
          { name: 'jiguan', type: 'varchar', length: '100', isNullable: true },
          { name: 'birthday', type: 'datetime', isNullable: true },
          { name: 'wxopenid', type: 'varchar', length: '255', isNullable: true },
          { name: 'archives', type: 'longtext', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('lx_wxuser', true);
    await queryRunner.dropTable('lx_user_jin', true);
    await queryRunner.dropTable('lx_user_banner', true);
    await queryRunner.dropTable('lx_information', true);
    await queryRunner.dropTable('lx_tweet', true);
    await queryRunner.dropTable('lx_article', true);
    await queryRunner.dropTable('lx_user_notice', true);
    await queryRunner.dropTable('lx_ruhui', true);
    await queryRunner.dropTable('lx_xiehui', true);
    await queryRunner.dropTable('lx_user_manager', true);
  }
}
