import { MigrationInterface, QueryRunner } from 'typeorm';

type ColumnMapping = {
  target: string;
  source: string;
};

export class ImportLegacyBusinessTables1714000009000
  implements MigrationInterface
{
  private readonly tables: Record<string, ColumnMapping[]> = {
    lx_user_manager: [
      { target: 'id', source: 'id' },
      { target: 'user_name', source: 'user_name' },
      { target: 'avater_url', source: 'avater_url' },
      { target: 'reg_date', source: 'reg_date' },
      { target: 'mobile', source: 'mobile' },
      { target: 'remark', source: 'remark' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_xiehui: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'avater_url', source: 'avaterUrl' },
      { target: 'remark', source: 'remark' },
      { target: 'create_time', source: 'create_time' },
      { target: 'update_time', source: 'update_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_ruhui: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'avater_url', source: 'avaterUrl' },
      { target: 'remark', source: 'remark' },
      { target: 'create_time', source: 'create_time' },
      { target: 'update_time', source: 'update_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_user_notice: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'releases', source: 'release' },
      { target: 'remark', source: 'remark' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_article: [
      { target: 'id', source: 'id' },
      { target: 'order_number', source: 'order_number' },
      { target: 'title', source: 'title' },
      { target: 'article_url', source: 'article_url' },
      { target: 'type', source: 'type' },
      { target: 'content_type', source: 'content_type' },
      { target: 'remark', source: 'remark' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_tweet: [
      { target: 'id', source: 'id' },
      { target: 'tweet_title', source: 'tweet_title' },
      { target: 'tweet_type', source: 'tweet_type' },
      { target: 'tweet_content', source: 'tweet_content' },
      { target: 'tweet_img', source: 'tweet_img' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_information: [
      { target: 'id', source: 'id' },
      { target: 'order_number', source: 'order_number' },
      { target: 'title', source: 'title' },
      { target: 'information_url', source: 'information_url' },
      { target: 'information_content', source: 'information_content' },
      { target: 'type', source: 'type' },
      { target: 'content_type', source: 'content_type' },
      { target: 'remark', source: 'remark' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_user_banner: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'avater_url', source: 'avater_url' },
      { target: 'releases', source: 'releases' },
      { target: 'point_url', source: 'point_url' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_user_jin: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'avater_url', source: 'avater_url' },
      { target: 'remark', source: 'remark' },
      { target: 'releases', source: 'releases' },
      { target: 'point_url', source: 'point_url' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_wxuser: [
      { target: 'id', source: 'id' },
      { target: 'user_name', source: 'user_name' },
      { target: 'user_english_name', source: 'user_english_name' },
      { target: 'reg_date', source: 'reg_date' },
      { target: 'order', source: 'order_num' },
      { target: 'liuxue_guo', source: 'liuxue_guo' },
      { target: 'mobile', source: 'mobile' },
      { target: 'liuxue_school', source: 'liuxue_school' },
      { target: 'major', source: 'major' },
      { target: 'certificate', source: 'certificate' },
      { target: 'gender', source: 'gender' },
      { target: 'company_name', source: 'company_name' },
      { target: 'vip', source: 'vip' },
      { target: 'company_post', source: 'company_post' },
      { target: 'company_address', source: 'company_address' },
      { target: 'status', source: 'status' },
      { target: 'remark', source: 'remark' },
      { target: 'post', source: 'post' },
      { target: 'nick_name', source: 'nick_name' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
      { target: 'avater_url', source: 'avater_url' },
      { target: 'email', source: 'email' },
      { target: 'jiguan', source: 'jiguan' },
      { target: 'birthday', source: 'birthday' },
      { target: 'wxopenid', source: 'wxopenid' },
      { target: 'archives', source: 'archives' },
    ],
    lx_activity: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'start_time', source: 'start_time' },
      { target: 'end_time', source: 'end_time' },
      { target: 'address', source: 'address' },
      { target: 'money', source: 'money' },
      { target: 'remark', source: 'remark' },
      { target: 'status', source: 'status' },
      { target: 'avater_url', source: 'avater_url' },
      { target: 'label_name', source: 'label_name' },
      { target: 'contact_name', source: 'contact_name' },
      { target: 'contact_mobile', source: 'contact_mobile' },
      { target: 'sign_quota', source: 'sign_quota' },
      { target: 'sign_type', source: 'sign_type' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_sign: [
      { target: 'id', source: 'id' },
      { target: 'user_id', source: 'user_id' },
      { target: 'activity_id', source: 'activity_id' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_video: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'avater_url', source: 'avater_url' },
      { target: 'releases', source: 'releases' },
      { target: 'feeld_id', source: 'feeld_id' },
      { target: 'finder_user_name', source: 'finder_user_name' },
      { target: 'remark', source: 'remark' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_vip: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'avater_url', source: 'avater_url' },
      { target: 'membership_describe', source: 'membership_describe' },
      { target: 'remark', source: 'remark' },
      { target: 'rule', source: 'rule' },
      { target: 'start_time', source: 'start_time' },
      { target: 'end_time', source: 'end_time' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_welfare: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'avater_url', source: 'avater_url' },
      { target: 'money', source: 'money' },
      { target: 'discount_type', source: 'discount_type' },
      { target: 'discount', source: 'discount' },
      { target: 'remark', source: 'remark' },
      { target: 'rule', source: 'rule' },
      { target: 'start_time', source: 'start_time' },
      { target: 'end_time', source: 'end_time' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_card: [
      { target: 'id', source: 'id' },
      { target: 'card_id', source: 'card_id' },
      { target: 'user_id', source: 'user_id' },
      { target: 'type', source: 'type' },
      { target: 'status', source: 'status' },
      { target: 'use_status', source: 'use_status' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_merchant: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'cover_url', source: 'cover_url' },
      { target: 'content', source: 'content' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
    lx_merchant_user: [
      { target: 'id', source: 'id' },
      { target: 'merchant_id', source: 'merchant_id' },
      { target: 'user_id', source: 'user_id' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
  };

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureLegacyCompatibleColumns(queryRunner);

    for (const [tableName, columns] of Object.entries(this.tables)) {
      const sourceTableExists = await this.hasLegacyTable(queryRunner, tableName);
      const targetTableExists = await queryRunner.hasTable(tableName);

      if (!sourceTableExists || !targetTableExists) {
        continue;
      }

      const targetColumns = columns
        .map((column) => this.quote(column.target))
        .join(', ');
      const sourceColumns = columns
        .map((column) => `legacy.${this.quote(column.source)}`)
        .join(', ');

      await queryRunner.query(`
        INSERT INTO ${this.quote(tableName)} (${targetColumns})
        SELECT ${sourceColumns}
        FROM \`liuxie\`.${this.quote(tableName)} legacy
        WHERE NOT EXISTS (
          SELECT 1
          FROM ${this.quote(tableName)} current_row
          WHERE current_row.\`id\` = legacy.\`id\`
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const tableName of Object.keys(this.tables).reverse()) {
      const sourceTableExists = await this.hasLegacyTable(queryRunner, tableName);
      const targetTableExists = await queryRunner.hasTable(tableName);

      if (!sourceTableExists || !targetTableExists) {
        continue;
      }

      await queryRunner.query(`
        DELETE current_row
        FROM ${this.quote(tableName)} current_row
        INNER JOIN \`liuxie\`.${this.quote(tableName)} legacy
          ON legacy.\`id\` = current_row.\`id\`
      `);
    }
  }

  private async ensureLegacyCompatibleColumns(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const hasVideoTable = await queryRunner.hasTable('lx_video');

    if (hasVideoTable) {
      await queryRunner.query(`
        ALTER TABLE \`lx_video\`
        MODIFY \`feeld_id\` varchar(500) NULL COMMENT '视频ID'
      `);
    }
  }

  private async hasLegacyTable(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'liuxie'
          AND table_name = ?
        LIMIT 1
      `,
      [tableName],
    );

    return rows.length > 0;
  }

  private quote(identifier: string): string {
    return `\`${identifier.replace(/`/g, '``')}\``;
  }
}
