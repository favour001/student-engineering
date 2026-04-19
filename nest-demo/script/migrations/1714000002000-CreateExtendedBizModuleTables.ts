import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateExtendedBizModuleTables1714000002000 implements MigrationInterface {
  name = 'CreateExtendedBizModuleTables';
  timestamp = 1714000002000;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lx_activity',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'start_time', type: 'datetime', isNullable: true },
          { name: 'end_time', type: 'datetime', isNullable: true },
          { name: 'address', type: 'varchar', length: '255', isNullable: true },
          { name: 'money', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', length: '50', isNullable: true },
          { name: 'avater_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'label_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'contact_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'contact_mobile', type: 'varchar', length: '50', isNullable: true },
          { name: 'sign_quota', type: 'int', default: 0 },
          { name: 'sign_type', type: 'varchar', length: '100', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_sign',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'bigint' },
          { name: 'activity_id', type: 'bigint' },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_video',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'avater_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'releases', type: 'tinyint', default: 0 },
          { name: 'feeld_id', type: 'varchar', length: '100', isNullable: true },
          { name: 'finder_user_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_vip',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'avater_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'membership_describe', type: 'text', isNullable: true },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'rule', type: 'text', isNullable: true },
          { name: 'start_time', type: 'datetime', isNullable: true },
          { name: 'end_time', type: 'datetime', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_welfare',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'avater_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'money', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'discount_type', type: 'varchar', length: '100', isNullable: true },
          { name: 'discount', type: 'varchar', length: '100', isNullable: true },
          { name: 'remark', type: 'text', isNullable: true },
          { name: 'rule', type: 'text', isNullable: true },
          { name: 'start_time', type: 'datetime', isNullable: true },
          { name: 'end_time', type: 'datetime', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lx_card',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'card_id', type: 'bigint' },
          { name: 'user_id', type: 'bigint' },
          { name: 'type', type: 'varchar', length: '20', isNullable: true },
          { name: 'status', type: 'varchar', length: '20', isNullable: true },
          { name: 'use_status', type: 'varchar', length: '20', isNullable: true },
          { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'create_by', type: 'varchar', length: '100', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('lx_card', true);
    await queryRunner.dropTable('lx_welfare', true);
    await queryRunner.dropTable('lx_vip', true);
    await queryRunner.dropTable('lx_video', true);
    await queryRunner.dropTable('lx_sign', true);
    await queryRunner.dropTable('lx_activity', true);
  }
}
