export interface SQLConnectionConfig {
  type: 'postgresql' | 'mysql' | 'sqlite';
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  filePath?: string;
}

export interface SchemaInfo {
  [schemaName: string]: {
    [tableName: string]: {
      column: string;
      type: string;
    }[];
  };
}

export interface TableColumn {
  column: string;
  type: string;
} 