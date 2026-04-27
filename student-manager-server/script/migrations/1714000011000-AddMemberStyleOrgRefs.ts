import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddMemberStyleOrgRefs1714000011000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasMemberStyleTable = await queryRunner.hasTable('lx_member_style');
    if (!hasMemberStyleTable) return;

    const table = await queryRunner.getTable('lx_member_style');

    if (!table?.findColumnByName('post_id')) {
      await queryRunner.addColumn(
        'lx_member_style',
        new TableColumn({
          name: 'post_id',
          type: 'bigint',
          isNullable: true,
          comment: '系统岗位ID',
        }),
      );
    }

    if (!table?.findColumnByName('dept_id')) {
      await queryRunner.addColumn(
        'lx_member_style',
        new TableColumn({
          name: 'dept_id',
          type: 'bigint',
          isNullable: true,
          comment: '系统部门ID',
        }),
      );
    }

    const refreshedTable = await queryRunner.getTable('lx_member_style');
    if (!refreshedTable?.indices.some((index) => index.name === 'IDX_lx_member_style_post_dept')) {
      await queryRunner.createIndex(
        'lx_member_style',
        new TableIndex({
          name: 'IDX_lx_member_style_post_dept',
          columnNames: ['post_id', 'dept_id'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasMemberStyleTable = await queryRunner.hasTable('lx_member_style');
    if (!hasMemberStyleTable) return;

    const table = await queryRunner.getTable('lx_member_style');
    if (table?.indices.some((index) => index.name === 'IDX_lx_member_style_post_dept')) {
      await queryRunner.dropIndex('lx_member_style', 'IDX_lx_member_style_post_dept');
    }
    if (table?.findColumnByName('dept_id')) {
      await queryRunner.dropColumn('lx_member_style', 'dept_id');
    }
    if (table?.findColumnByName('post_id')) {
      await queryRunner.dropColumn('lx_member_style', 'post_id');
    }
  }
}
