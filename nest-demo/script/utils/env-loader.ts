import * as fs from 'fs';
import * as path from 'path';

export type MysqlEnvConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export function loadEnvFile(envPath = path.resolve(process.cwd(), '.env')) {
  const env: Record<string, string> = {};

  if (!fs.existsSync(envPath)) {
    throw new Error(`Env file not found: ${envPath}`);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

export function loadMysqlEnvConfig() {
  const env = loadEnvFile();

  return {
    host: env.MYSQL_HOST,
    port: Number(env.MYSQL_PORT ?? 3306),
    user: env.MYSQL_USERNAME,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATA_BASE,
  } satisfies MysqlEnvConfig;
}
