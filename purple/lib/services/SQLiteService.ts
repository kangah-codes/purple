import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import * as SQLite from 'expo-sqlite';
import { DataService } from './DataService';

export abstract class BaseSQLiteService<T> implements DataService<T> {
    protected db: SQLite.SQLiteDatabase;

    constructor(
        protected tableName: string,
        protected sqlite: SQLite.SQLiteDatabase,
    ) {
        this.db = sqlite;
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

    async create(data: any): Promise<GenericAPIResponse<T>> {
        throw new Error('Not implemented');
    }

    async update(id: string, data: any): Promise<GenericAPIResponse<T>> {
        throw new Error('Not implemented');
    }

    async delete(id: string): Promise<GenericAPIResponse<null>> {
        throw new Error('Not implemented');
    }
}
