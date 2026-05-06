import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from 'typeorm';

export class CreateBusinessContentCategories1714000013000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasCategoryTable = await queryRunner.hasTable('business_content_category');
    if (!hasCategoryTable) {
      await queryRunner.createTable(
        new Table({
          name: 'business_content_category',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'business_key', type: 'varchar', length: '64' },
            { name: 'name', type: 'varchar', length: '100' },
            { name: 'code', type: 'varchar', length: '100' },
            { name: 'sort_number', type: 'int', default: '0' },
            { name: 'status', type: 'int', default: '0' },
            { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
            { name: 'update_time', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          ],
        }),
        true,
      );
      await queryRunner.createIndex(
        'business_content_category',
        new TableIndex({
          name: 'IDX_business_content_category_key_code',
          columnNames: ['business_key', 'code'],
          isUnique: true,
        }),
      );
      await queryRunner.createIndex(
        'business_content_category',
        new TableIndex({
          name: 'IDX_business_content_category_key_sort',
          columnNames: ['business_key', 'sort_number'],
        }),
      );
    }

    await this.ensureCategoryColumn(queryRunner, 'lx_merchant');
    await this.ensureCategoryColumn(queryRunner, 'lx_tweet');
    await this.seedCategories(queryRunner);
    await this.backfillCategories(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasMerchantTable = await queryRunner.hasTable('lx_merchant');
    if (hasMerchantTable) {
      const table = await queryRunner.getTable('lx_merchant');
      if (table?.findColumnByName('category_id')) await queryRunner.dropColumn('lx_merchant', 'category_id');
    }

    const hasTweetTable = await queryRunner.hasTable('lx_tweet');
    if (hasTweetTable) {
      const table = await queryRunner.getTable('lx_tweet');
      if (table?.findColumnByName('category_id')) await queryRunner.dropColumn('lx_tweet', 'category_id');
    }

    const hasCategoryTable = await queryRunner.hasTable('business_content_category');
    if (hasCategoryTable) await queryRunner.dropTable('business_content_category', true);
  }

  private async ensureCategoryColumn(queryRunner: QueryRunner, tableName: string) {
    const hasTable = await queryRunner.hasTable(tableName);
    if (!hasTable) return;
    const table = await queryRunner.getTable(tableName);
    if (!table?.findColumnByName('category_id')) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'category_id',
          type: 'bigint',
          isNullable: true,
          comment: '业务分类ID',
        }),
      );
      await queryRunner.createIndex(
        tableName,
        new TableIndex({
          name: `IDX_${tableName}_category_id`,
          columnNames: ['category_id'],
        }),
      );
    }
  }

  private async seedCategories(queryRunner: QueryRunner) {
    await queryRunner.query(`
      INSERT INTO \`business_content_category\` (\`business_key\`, \`name\`, \`code\`, \`sort_number\`, \`status\`)
      VALUES
        ('service-platform', '运动类', 'sports', 10, 0),
        ('service-platform', '健康管理类', 'health', 20, 0),
        ('innovation-shunde', '人才政策', '1', 10, 0),
        ('innovation-shunde', '留创园信息', '2', 20, 0),
        ('innovation-shunde', '创新创业扶持政策', '3', 30, 0),
        ('innovation-shunde', '人才招聘', '4', 40, 0)
      ON DUPLICATE KEY UPDATE
        \`name\` = VALUES(\`name\`),
        \`sort_number\` = VALUES(\`sort_number\`),
        \`status\` = VALUES(\`status\`)
    `);
  }

  private async backfillCategories(queryRunner: QueryRunner) {
    await queryRunner.query(`
      UPDATE \`lx_tweet\` tweet
      INNER JOIN \`business_content_category\` category
        ON category.\`business_key\` = 'innovation-shunde'
       AND category.\`code\` = CAST(tweet.\`tweet_type\` AS CHAR)
      SET tweet.\`category_id\` = category.\`id\`
      WHERE tweet.\`category_id\` IS NULL
    `);
  }
}
