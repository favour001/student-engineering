import * as mysql from 'mysql2/promise';
import { loadMysqlEnvConfig } from './utils/env-loader';

const SOURCE_DATABASE = 'liuxie';
const TARGET_DATABASE = 'liu_xue_sheng';
const EXECUTE = process.argv.includes('--execute');

const COLUMN_RENAMES: Record<string, Record<string, string>> = {
  lx_ruhui: {
    avater_url: 'avaterUrl',
  },
  lx_user_notice: {
    releases: 'release',
  },
  lx_wxuser: {
    order: 'order_num',
  },
  lx_xiehui: {
    avater_url: 'avaterUrl',
  },
};

type ColumnRow = {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  COLUMN_TYPE: string;
};

function quoteIdentifier(identifier: string) {
  return `\`${identifier.replace(/`/g, '``')}\``;
}

async function getTableNames(connection: mysql.Connection, database: string) {
  const [rows] = await connection.query(
    `
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME LIKE 'lx\\_%'
      ORDER BY TABLE_NAME
    `,
    [database],
  );

  return (rows as Array<{ TABLE_NAME: string }>).map((row) => row.TABLE_NAME);
}

async function getColumns(connection: mysql.Connection, database: string) {
  const [rows] = await connection.query(
    `
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME LIKE 'lx\\_%'
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `,
    [database],
  );

  const tableMap = new Map<string, ColumnRow[]>();

  for (const row of rows as ColumnRow[]) {
    const list = tableMap.get(row.TABLE_NAME) ?? [];
    list.push(row);
    tableMap.set(row.TABLE_NAME, list);
  }

  return tableMap;
}

async function getTableCount(
  connection: mysql.Connection,
  database: string,
  tableName: string,
) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count FROM ${quoteIdentifier(database)}.${quoteIdentifier(tableName)}`,
  );

  return (rows as Array<{ count: number }>)[0]?.count ?? 0;
}

async function syncTable(
  connection: mysql.Connection,
  tableName: string,
  sourceColumns: ColumnRow[],
  targetColumns: ColumnRow[],
) {
  const sourceColumnNames = new Set(sourceColumns.map((column) => column.COLUMN_NAME));
  const targetColumnNames = new Set(targetColumns.map((column) => column.COLUMN_NAME));
  const tableRenames = COLUMN_RENAMES[tableName] ?? {};

  const mappedColumns = targetColumns
    .map((targetColumn) => {
      const directMatch = sourceColumnNames.has(targetColumn.COLUMN_NAME)
        ? targetColumn.COLUMN_NAME
        : null;
      const renameMatch = tableRenames[targetColumn.COLUMN_NAME];
      const sourceColumnName =
        directMatch ?? (renameMatch && sourceColumnNames.has(renameMatch) ? renameMatch : null);

      return sourceColumnName
        ? {
            targetColumn: targetColumn.COLUMN_NAME,
            sourceColumn: sourceColumnName,
          }
        : null;
    })
    .filter(
      (
        value,
      ): value is {
        targetColumn: string;
        sourceColumn: string;
      } => Boolean(value),
    );

  const missingInTarget = sourceColumns
    .filter(
      (column) =>
        !targetColumnNames.has(column.COLUMN_NAME) &&
        !Object.values(tableRenames).includes(column.COLUMN_NAME),
    )
    .map((column) => `${column.COLUMN_NAME}:${column.COLUMN_TYPE}`);

  const missingInSource = targetColumns
    .filter(
      (column) =>
        !sourceColumnNames.has(column.COLUMN_NAME) &&
        !Object.keys(tableRenames).includes(column.COLUMN_NAME),
    )
    .map((column) => `${column.COLUMN_NAME}:${column.COLUMN_TYPE}`);

  const sourceCount = await getTableCount(connection, SOURCE_DATABASE, tableName);
  const targetCountBefore = await getTableCount(connection, TARGET_DATABASE, tableName);

  let affectedRows = 0;

  if (EXECUTE && mappedColumns.length > 0) {
    const targetColumnSql = mappedColumns
      .map((item) => quoteIdentifier(item.targetColumn))
      .join(', ');
    const selectColumnSql = mappedColumns
      .map(
        (item) =>
          `${quoteIdentifier(item.sourceColumn)} AS ${quoteIdentifier(item.targetColumn)}`,
      )
      .join(', ');
    const updateColumnSql = mappedColumns
      .filter((item) => item.targetColumn !== 'id')
      .map(
        (item) =>
          `${quoteIdentifier(item.targetColumn)} = VALUES(${quoteIdentifier(item.targetColumn)})`,
      )
      .join(', ');

    const sql = `
      INSERT INTO ${quoteIdentifier(TARGET_DATABASE)}.${quoteIdentifier(tableName)} (${targetColumnSql})
      SELECT ${selectColumnSql}
      FROM ${quoteIdentifier(SOURCE_DATABASE)}.${quoteIdentifier(tableName)}
      ON DUPLICATE KEY UPDATE ${updateColumnSql}
    `;

    const [result] = await connection.query<mysql.ResultSetHeader>(sql);
    affectedRows = result.affectedRows;
  }

  const targetCountAfter = EXECUTE
    ? await getTableCount(connection, TARGET_DATABASE, tableName)
    : targetCountBefore;

  return {
    tableName,
    sourceCount,
    targetCountBefore,
    targetCountAfter,
    mappedColumns,
    missingInTarget,
    missingInSource,
    affectedRows,
    executed: EXECUTE,
  };
}

async function main() {
  const config = loadMysqlEnvConfig();
  const connection = await mysql.createConnection(config);

  try {
    const sourceTables = await getTableNames(connection, SOURCE_DATABASE);
    const targetTables = await getTableNames(connection, TARGET_DATABASE);
    const tables = targetTables.filter((tableName) => sourceTables.includes(tableName));
    const sourceColumns = await getColumns(connection, SOURCE_DATABASE);
    const targetColumns = await getColumns(connection, TARGET_DATABASE);

    const results = [];

    for (const tableName of tables) {
      const sourceTableColumns = sourceColumns.get(tableName) ?? [];
      const targetTableColumns = targetColumns.get(tableName) ?? [];
      results.push(
        await syncTable(
          connection,
          tableName,
          sourceTableColumns,
          targetTableColumns,
        ),
      );
    }

    console.log(JSON.stringify({ execute: EXECUTE, tables: results }, null, 2));
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error?.stack ?? error);
  process.exit(1);
});
