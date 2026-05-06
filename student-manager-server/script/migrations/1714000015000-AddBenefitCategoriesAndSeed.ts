import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddBenefitCategoriesAndSeed1714000015000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureCategoryColumn(queryRunner, 'lx_vip');
    await this.ensureCategoryColumn(queryRunner, 'lx_welfare');

    await queryRunner.query(`
      INSERT INTO \`business_content_category\` (\`business_key\`, \`name\`, \`code\`, \`sort_number\`, \`status\`)
      VALUES
        ('vip', '基础会员卡', 'basic', 10, 0),
        ('vip', '专属权益卡', 'exclusive', 20, 0),
        ('welfare', '生活福利', 'life', 10, 0),
        ('welfare', '学习福利', 'study', 20, 0),
        ('welfare', '商家优惠', 'merchant', 30, 0)
      ON DUPLICATE KEY UPDATE
        \`name\` = VALUES(\`name\`),
        \`sort_number\` = VALUES(\`sort_number\`),
        \`status\` = VALUES(\`status\`)
    `);

    await this.backfillDefaultCategory(queryRunner, 'lx_vip', 'vip');
    await this.backfillDefaultCategory(queryRunner, 'lx_welfare', 'welfare');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropCategoryColumn(queryRunner, 'lx_vip');
    await this.dropCategoryColumn(queryRunner, 'lx_welfare');
    await queryRunner.query(`
      DELETE FROM \`business_content_category\`
      WHERE \`business_key\` IN ('vip', 'welfare')
    `);
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

  private async dropCategoryColumn(queryRunner: QueryRunner, tableName: string) {
    const hasTable = await queryRunner.hasTable(tableName);
    if (!hasTable) return;
    const table = await queryRunner.getTable(tableName);
    const index = table?.indices.find((item) => item.name === `IDX_${tableName}_category_id`);
    if (index) await queryRunner.dropIndex(tableName, index);
    if (table?.findColumnByName('category_id')) {
      await queryRunner.dropColumn(tableName, 'category_id');
    }
  }

  private async backfillDefaultCategory(
    queryRunner: QueryRunner,
    tableName: string,
    businessKey: 'vip' | 'welfare',
  ) {
    await queryRunner.query(
      `
        UPDATE \`${tableName}\` target
        INNER JOIN (
          SELECT \`id\`
          FROM \`business_content_category\`
          WHERE \`business_key\` = ?
          ORDER BY \`sort_number\` ASC, \`id\` ASC
          LIMIT 1
        ) category ON 1 = 1
        SET target.\`category_id\` = category.\`id\`
        WHERE target.\`category_id\` IS NULL
      `,
      [businessKey],
    );
  }
}
