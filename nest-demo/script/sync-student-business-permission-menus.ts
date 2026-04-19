import * as mysql from 'mysql2/promise';
import { loadMysqlEnvConfig } from './utils/env-loader';

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

async function main() {
  const config = loadMysqlEnvConfig();
  const connection = await mysql.createConnection(config);

  try {
    for (const categoryCode of BUSINESS_CATEGORY_CODES) {
      await connection.query(
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

    let createdButtons = 0;

    for (const seed of buildButtonSeeds()) {
      const [result] = await connection.query<mysql.ResultSetHeader>(
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

      createdButtons += result.affectedRows;
    }

    const [rows] = await connection.query(
      `
        SELECT COUNT(*) AS count
        FROM sys_menu
        WHERE category = 2
          AND type = 3
      `,
    );

    console.log(
      JSON.stringify(
        {
          updatedMenus: BUSINESS_CATEGORY_CODES.length,
          createdButtons,
          totalBusinessButtons: (rows as Array<{ count: number }>)[0]?.count ?? 0,
        },
        null,
        2,
      ),
    );
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error?.stack ?? error);
  process.exit(1);
});
