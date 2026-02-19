export interface Module {
    id: string;
    name: string;
    description?: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
}

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
    permissions?: string[];
}

export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    query?: string | null;
    tableName?: string | null;
    procedureName?: string | null;
    procedureParams?: any[] | null;
}

export interface FileMetadata {
    fileName: string;
    filePath: string;
    fileSize: number;
    sheetName?: string | null;
    delimiter?: string;
    hasHeader?: boolean;
}

export interface ApiConfig {
    url: string;
    method: string;
    headers?: Record<string, string>;
    authType?: string;
    apiKey?: string;
}

export interface DataSource {
    id: string;
    name: string;
    type: 'postgres' | 'mysql' | 'sqlserver' | 'mongodb' | 'oracle' | 'excel' | 'csv' | 'api';
    connectionType?: 'table' | 'query' | 'procedure' | 'file';
    config?: DatabaseConfig | ApiConfig;
    fileMetadata?: FileMetadata;
    status?: 'active' | 'pending' | 'connected' | 'error';
    createdAt: string;
    updatedAt?: string;
}

export interface Report {
    id: string;
    name: string;
    description?: string;
    sourceId: string;
    config: any; // Object, not string
    createdAt: string;
    updatedAt?: string;
}

export interface Dashboard {
    id: string;
    name: string;
    description?: string;
    layout: string; // JSON string
    createdAt: string;
    updatedAt: string;
}

export interface Settings {
    defaultDashboardId?: string | null;
    theme?: string;
    emailNotifications?: boolean;
}

