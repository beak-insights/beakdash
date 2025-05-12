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

export interface IWidgetDimensions {
  width: number;
  height: number;
}

export interface IFilterConfig {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains";
  value: string | number | boolean;
}

export interface ITableConfig {
  headers?: string[];
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "none";
  filters?: IFilterConfig[];
}