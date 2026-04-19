import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMerchantTables1714000003000
  implements MigrationInterface
{
  name = 'CreateMerchantTables';
  timestamp = 1714000003000;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lx_merchant',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'title', type: 'varchar', length: '200' },
          {
            name: 'cover_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          { name: 'content', type: 'longtext', isNullable: true },
          {
            name: 'create_time',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_merchant_user',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'merchant_id', type: 'bigint' },
          { name: 'user_id', type: 'bigint' },
          {
            name: 'create_time',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'create_by', type: 'varchar', length: '100', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('lx_merchant_user', true);
    await queryRunner.dropTable('lx_merchant', true);
  }
}
