export interface Migration {
  name: string;
  timestamp: number;
  up(queryRunner: any): Promise<void>;
  down(queryRunner: any): Promise<void>;
}

export interface MigrationOptions {
  verbose?: boolean;
  dryRun?: boolean;
}

export interface MigrationRecord {
  id: number;
  timestamp: number;
  name: string;
  executed_at: Date;
}
