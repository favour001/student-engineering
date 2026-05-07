import { MigrationInterface, QueryRunner } from 'typeorm';

type ColumnMapping = {
  target: string;
  source: string;
};

export class RefreshRecentLegacyData1714000017000
  implements MigrationInterface
{
  private readonly businessTables: Record<string, ColumnMapping[]> = {
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
    lx_user_banner: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'avater_url', source: 'avater_url' },
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
    lx_merchant: [
      { target: 'id', source: 'id' },
      { target: 'title', source: 'title' },
      { target: 'cover_url', source: 'cover_url' },
      { target: 'content', source: 'content' },
      { target: 'create_time', source: 'create_time' },
      { target: 'create_by', source: 'create_by' },
    ],
  };

  private readonly fileStorageColumns = [
    'file_key',
    'original_file_name',
    'hash_val',
    'file_type',
    'file_path',
    'file_size',
    'file_ext',
    'content_type',
    'store_way',
    'store_region',
    'is_temp',
    'expire_time',
    'db_path',
    'env',
    'application',
    'bucket',
    'extra',
    'remark',
    'cre_sb',
    'cre_time',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [tableName, columns] of Object.entries(this.businessTables)) {
      await this.upsertLegacyRowsById(queryRunner, tableName, columns);
    }

    await this.upsertFileStorageRows(queryRunner);
    await this.refreshMemberStyleRows(queryRunner);
  }

  public async down(): Promise<void> {
    // Intentionally no-op. This refresh aligns target data with liuxie and
    // cannot safely restore the previous target values.
  }

  private async upsertLegacyRowsById(
    queryRunner: QueryRunner,
    tableName: string,
    columns: ColumnMapping[],
  ): Promise<void> {
    const sourceTableExists = await this.hasLegacyTable(queryRunner, tableName);
    const targetTableExists = await queryRunner.hasTable(tableName);

    if (!sourceTableExists || !targetTableExists) {
      return;
    }

    const targetColumns = columns
      .map((column) => this.quote(column.target))
      .join(', ');
    const sourceColumns = columns
      .map((column) => `legacy.${this.quote(column.source)}`)
      .join(', ');
    const updates = columns
      .filter((column) => column.target !== 'id')
      .map(
        (column) =>
          `${this.quote(column.target)} = VALUES(${this.quote(column.target)})`,
      )
      .join(', ');

    await queryRunner.query(`
      INSERT INTO ${this.quote(tableName)} (${targetColumns})
      SELECT ${sourceColumns}
      FROM \`liuxie\`.${this.quote(tableName)} legacy
      ON DUPLICATE KEY UPDATE ${updates}
    `);
  }

  private async upsertFileStorageRows(queryRunner: QueryRunner): Promise<void> {
    const sourceTableExists = await this.hasLegacyTable(
      queryRunner,
      'file_storage',
    );
    const targetTableExists = await queryRunner.hasTable('file_storage');

    if (!sourceTableExists || !targetTableExists) {
      return;
    }

    const columns = this.fileStorageColumns
      .map((column) => this.quote(column))
      .join(', ');
    const sourceColumns = this.fileStorageColumns
      .map((column) => `legacy.${this.quote(column)}`)
      .join(', ');
    const updates = this.fileStorageColumns
      .filter((column) => column !== 'file_key')
      .map((column) => `${this.quote(column)} = VALUES(${this.quote(column)})`)
      .join(', ');

    await queryRunner.query(`
      INSERT INTO \`file_storage\` (${columns})
      SELECT ${sourceColumns}
      FROM \`liuxie\`.\`file_storage\` legacy
      ON DUPLICATE KEY UPDATE ${updates}
    `);
  }

  private async refreshMemberStyleRows(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const sourceTableExists = await this.hasLegacyTable(queryRunner, 'sys_user');
    const targetTableExists = await queryRunner.hasTable('lx_member_style');

    if (!sourceTableExists || !targetTableExists) {
      return;
    }

    await queryRunner.query(`
      UPDATE \`lx_member_style\` current_member
      INNER JOIN \`liuxie\`.\`sys_user\` legacy
        ON current_member.\`legacy_user_id\` = legacy.\`id\`
      SET
        current_member.\`order_number\` = legacy.\`order_number\`,
        current_member.\`user_name\` = legacy.\`user_name\`,
        current_member.\`display_name\` = NULLIF(legacy.\`nick_name\`, ''),
        current_member.\`job_title\` = NULLIF(legacy.\`job_name\`, ''),
        current_member.\`member_rank\` = NULLIF(legacy.\`user_sort\`, ''),
        current_member.\`joined_at\` = legacy.\`create_time\`,
        current_member.\`mobile\` = NULLIF(legacy.\`phonenumber\`, ''),
        current_member.\`email\` = NULLIF(legacy.\`email\`, ''),
        current_member.\`gender\` = CASE legacy.\`sex\`
          WHEN '1' THEN '1'
          WHEN '2' THEN '2'
          ELSE NULL
        END,
        current_member.\`avatar_url\` = NULLIF(legacy.\`avatar\`, ''),
        current_member.\`background_url\` = NULLIF(legacy.\`background_url\`, ''),
        current_member.\`honor_remark\` = legacy.\`honor_remark\`,
        current_member.\`graduation_school\` = NULLIF(legacy.\`graduation_school\`, ''),
        current_member.\`study_area\` = NULLIF(legacy.\`study_area\`, ''),
        current_member.\`company_remark\` = legacy.\`company_remark\`,
        current_member.\`job_remark\` = legacy.\`job_remark\`,
        current_member.\`social_post_remark\` = legacy.\`society_job_remark\`,
        current_member.\`sort_number\` = COALESCE(legacy.\`order_number\`, 0),
        current_member.\`status\` = CASE WHEN legacy.\`status\` = '0' THEN 0 ELSE 1 END,
        current_member.\`create_by\` = NULLIF(legacy.\`create_by\`, ''),
        current_member.\`create_time\` = legacy.\`create_time\`,
        current_member.\`update_by\` = NULLIF(legacy.\`update_by\`, ''),
        current_member.\`update_time\` = legacy.\`update_time\`
      WHERE legacy.\`user_name\` IS NOT NULL
        AND legacy.\`user_name\` <> ''
        AND legacy.\`user_name\` <> 'admin'
        AND legacy.\`del_flag\` = '0'
    `);

    await queryRunner.query(`
      INSERT INTO \`lx_member_style\` (
        \`id\`, \`legacy_user_id\`, \`order_number\`, \`user_name\`, \`display_name\`,
        \`job_title\`, \`member_rank\`, \`joined_at\`, \`mobile\`, \`email\`, \`gender\`,
        \`avatar_url\`, \`background_url\`, \`honor_remark\`, \`graduation_school\`,
        \`study_area\`, \`company_remark\`, \`job_remark\`, \`social_post_remark\`,
        \`sort_number\`, \`status\`, \`create_by\`, \`create_time\`, \`update_by\`, \`update_time\`
      )
      SELECT
        legacy.\`id\`,
        legacy.\`id\`,
        legacy.\`order_number\`,
        legacy.\`user_name\`,
        NULLIF(legacy.\`nick_name\`, ''),
        NULLIF(legacy.\`job_name\`, ''),
        NULLIF(legacy.\`user_sort\`, ''),
        legacy.\`create_time\`,
        NULLIF(legacy.\`phonenumber\`, ''),
        NULLIF(legacy.\`email\`, ''),
        CASE legacy.\`sex\`
          WHEN '1' THEN '1'
          WHEN '2' THEN '2'
          ELSE NULL
        END,
        NULLIF(legacy.\`avatar\`, ''),
        NULLIF(legacy.\`background_url\`, ''),
        legacy.\`honor_remark\`,
        NULLIF(legacy.\`graduation_school\`, ''),
        NULLIF(legacy.\`study_area\`, ''),
        legacy.\`company_remark\`,
        legacy.\`job_remark\`,
        legacy.\`society_job_remark\`,
        COALESCE(legacy.\`order_number\`, 0),
        CASE WHEN legacy.\`status\` = '0' THEN 0 ELSE 1 END,
        NULLIF(legacy.\`create_by\`, ''),
        legacy.\`create_time\`,
        NULLIF(legacy.\`update_by\`, ''),
        legacy.\`update_time\`
      FROM \`liuxie\`.\`sys_user\` legacy
      WHERE legacy.\`user_name\` IS NOT NULL
        AND legacy.\`user_name\` <> ''
        AND legacy.\`user_name\` <> 'admin'
        AND legacy.\`del_flag\` = '0'
        AND NOT EXISTS (
          SELECT 1
          FROM \`lx_member_style\` current_member
          WHERE current_member.\`legacy_user_id\` = legacy.\`id\`
        )
    `);
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
