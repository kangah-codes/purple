import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import * as SQLite from 'expo-sqlite';
import { DataService } from './DataService';
import migrations from '../migrations';

export abstract class BaseSQLiteService<T> implements DataService<T> {
    protected db: SQLite.SQLiteDatabase;

    constructor(
        protected tableName: string,
        protected sqlite: SQLite.SQLiteDatabase,
    ) {
        this.db = sqlite;
        this.initializeTable().catch((error) => {
            console.error(`Failed to initialize table ${tableName}:`, error);
        });
    }

    private async initializeTable(): Promise<void> {
        const migration = migrations[this.tableName];
        if (!migration) {
            throw new Error(`No migration found for table ${this.tableName}`);
        }

        return new Promise((resolve, reject) => {
            this.db
                .execAsync(migration)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    protected formatResponse<R>({
        data,
        status,
        page,
        page_size,
        total,
        total_items,
        message,
    }: GenericAPIResponse<R>): GenericAPIResponse<R> {
        return { data, status, page, page_size, total, total_items, message };
    }

    async get(id: string): Promise<GenericAPIResponse<T>> {
        throw new Error('Not implemented!');
    }

    async list(query?: RequestParamQuery): Promise<GenericAPIResponse<T[]>> {
        throw new Error('Not implemented');
    }

    async create(data: Partial<T>): Promise<GenericAPIResponse<T>> {
        throw new Error('Not implemented');
    }

    async update(id: string, data: Partial<T>): Promise<GenericAPIResponse<T>> {
        throw new Error('Not implemented');
    }

    async delete(id: string): Promise<void> {
        throw new Error('Not implemented');
    }
}
