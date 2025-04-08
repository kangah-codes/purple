import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import * as SQLite from 'expo-sqlite';
import { DataService } from './DataService';
import migrations from '../migrations';

export abstract class BaseSQLiteService<T> implements DataService<T> {
    protected db: SQLite.SQLiteDatabase;

    constructor(protected tableName: string) {
        this.db = SQLite.openDatabaseSync('purple.db');
        this.initialiseTable();
    }

    private initialiseTable(): void {
        if (!migrations[this.tableName]) {
            throw new Error(`Migration does not exist for table ${this.tableName}`);
        }
        this.db.withTransactionAsync(async () => {
            await this.db.runAsync(migrations[this.tableName], []);
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
