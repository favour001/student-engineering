import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppPageMenu1714000014000 implements MigrationInterface {
  name = 'CreateAppPageMenu1714000014000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('app_page_menu');
    if (!hasTable) {
      await queryRunner.query(`
        CREATE TABLE app_page_menu (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(80) NOT NULL COMMENT '页面名称',
          path varchar(200) NOT NULL COMMENT '小程序页面路径',
          icon varchar(80) NULL COMMENT '图标标识',
          sort_number int NOT NULL DEFAULT 0 COMMENT '排序',
          status tinyint NOT NULL DEFAULT 0 COMMENT '状态 0启用 1禁用',
          remark varchar(255) NULL COMMENT '备注',
          create_time datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          update_time datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }

    const rows: Array<[string, string, string, number]> = [
      ['协会介绍', '/pages/introduce/index', 'society', 10],
      ['成员风采', '/pages/memberStyle/index', 'member-style', 20],
      ['留创顺德', '/pages/stayInShunDe/index', 'innovation-shunde', 30],
      ['入会申请', '/pages/application/index', 'application', 40],
      ['视频', '/pages/video/index', 'video', 50],
      ['公告', '/pages/notice/index', 'notice', 60],
      ['留学服务', '/pages/merchant/index', 'service-platform', 70],
      ['会员福利', '/pages/welfare/detail', 'welfare', 80],
      ['卡包', '/pages/cardpackage/index', 'cardpackage', 90],
      ['我的资料', '/pages/profile/index', 'profile', 100],
    ];

    for (const [name, path, icon, sortNumber] of rows) {
      const exists = await queryRunner.query(
        'SELECT id FROM app_page_menu WHERE path = ? LIMIT 1',
        [path],
      );
      if (!exists.length) {
        await queryRunner.query(
          'INSERT INTO app_page_menu (name, path, icon, sort_number, status, remark) VALUES (?, ?, ?, ?, 0, ?)',
          [name, path, icon, sortNumber, name],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('app_page_menu');
    if (hasTable) {
      await queryRunner.query('DROP TABLE app_page_menu');
    }
  }
}
