import { MigrationInterface, QueryRunner } from 'typeorm';

type MenuSeed = {
  parentCode: string;
  code: string;
  permission: string;
  sortNumber: number;
};

const BASE_ACTIONS = ['list', 'view', 'add', 'edit', 'delete'] as const;
const STATUS_CATEGORIES = new Set([
  'notice',
  'video',
  'banner',
  'quick-access',
  'wechat-user',
]);
const ASSIGN_CATEGORIES = new Set(['vip', 'welfare', 'service-platform']);
const REVOKE_CATEGORIES = new Set(['service-platform']);

const BUSINESS_CATEGORY_CODES = [
  'activity',
  'sign',
  'member-style',
  'association-intro',
  'joining-guide',
  'notice',
  'article',
  'innovation-shunde',
  'study-abroad-news',
  'video',
  'banner',
  'quick-access',
  'service-platform',
  'wechat-user',
  'vip',
  'welfare',
  'card',
] as const;

function buildButtonSeeds(): MenuSeed[] {
  const seeds: MenuSeed[] = [];

  for (const categoryCode of BUSINESS_CATEGORY_CODES) {
    BASE_ACTIONS.forEach((action, index) => {
      seeds.push({
        parentCode: categoryCode,
        code: `${categoryCode}:${action}`,
        permission: `${categoryCode}:${action}`,
        sortNumber: index + 1,
      });
    });

    let nextSort = BASE_ACTIONS.length + 1;

    if (STATUS_CATEGORIES.has(categoryCode)) {
      seeds.push({
        parentCode: categoryCode,
        code: `${categoryCode}:status`,
        permission: `${categoryCode}:status`,
        sortNumber: nextSort++,
      });
    }

    if (ASSIGN_CATEGORIES.has(categoryCode)) {
      seeds.push({
        parentCode: categoryCode,
        code: `${categoryCode}:assign`,
        permission: `${categoryCode}:assign`,
        sortNumber: nextSort++,
      });
    }

    if (REVOKE_CATEGORIES.has(categoryCode)) {
      seeds.push({
        parentCode: categoryCode,
        code: `${categoryCode}:revoke`,
        permission: `${categoryCode}:revoke`,
        sortNumber: nextSort,
      });
    }
  }

  return seeds;
}

export class SeedStudentBusinessPermissionMenus1714000004000
  implements MigrationInterface
{
  name = 'SeedStudentBusinessPermissionMenus';
  timestamp = 1714000004000;

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const categoryCode of BUSINESS_CATEGORY_CODES) {
      await queryRunner.query(
        `
          UPDATE sys_menu
          SET permission = ?
          WHERE category = 2
            AND type = 2
            AND code = ?
        `,
        [`${categoryCode}:menu`, categoryCode],
      );
    }

    const buttonSeeds = buildButtonSeeds();

    for (const seed of buttonSeeds) {
      await queryRunner.query(
        `
          INSERT INTO sys_menu (
            name,
            code,
            sort_number,
            type,
            category,
            icon,
            component,
          path,
            permission,
            status,
            parent_id,
            \`describe\`,
            create_by,
            update_by
          )
          SELECT
            ?,
            ?,
            ?,
            3,
            2,
            '',
            '',
            '',
            ?,
            0,
            parent_menu.id,
            ?,
            'system',
            'system'
          FROM sys_menu parent_menu
          WHERE parent_menu.code = ?
            AND NOT EXISTS (
              SELECT 1
              FROM sys_menu existing_menu
              WHERE existing_menu.code = ?
                AND existing_menu.parent_id = parent_menu.id
            )
        `,
        [
          seed.code,
          seed.code,
          seed.sortNumber,
          seed.permission,
          `student business permission ${seed.permission}`,
          seed.parentCode,
          seed.code,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const buttonSeeds = buildButtonSeeds();

    for (const seed of buttonSeeds) {
      await queryRunner.query(
        `
          DELETE child_menu
          FROM sys_menu child_menu
          INNER JOIN sys_menu parent_menu
            ON child_menu.parent_id = parent_menu.id
          WHERE child_menu.type = 3
            AND parent_menu.code = ?
            AND child_menu.code = ?
        `,
        [seed.parentCode, seed.code],
      );
    }

    for (const categoryCode of BUSINESS_CATEGORY_CODES) {
      await queryRunner.query(
        `
          UPDATE sys_menu
          SET permission = 'content:menu'
          WHERE category = 2
            AND type = 2
            AND code = ?
        `,
        [categoryCode],
      );
    }
  }
}
