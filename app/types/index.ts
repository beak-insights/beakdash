export interface SQLConnectionConfig {
  type: 'postgresql' | 'mysql' | 'sqlite';
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
  filePath?: string;
}

export interface SQLiteTable {
  name: string;
}

export interface SQLiteColumn {
  name: string;
  type: string;
  notnull: number;
  pk: number;
} 