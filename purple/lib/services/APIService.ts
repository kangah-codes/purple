import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { stringify } from '../utils/string';
import { DataService } from './DataService';
import { SessionData } from '@/components/Auth/schema';
import HTTPError from '../utils/error';

export class APIService<T> implements DataService<T> {
    constructor(
        private baseUrl: string,
        private endpoint: string,
        private sessionData: SessionData,
    ) {}

    create(data: Partial<T>): Promise<GenericAPIResponse<T>> {
        throw new Error('Method not implemented.');
    }
    update(id: string, data: Partial<T>): Promise<GenericAPIResponse<T>> {
        throw new Error('Method not implemented.');
    }
    delete(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async get(id: string): Promise<GenericAPIResponse<T>> {
        const res = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`, {
            method: 'GET',
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                Authorization: this.sessionData.access_token,
            },
        });
        const statusCode = res.status;
        const json = (await res.json()) as GenericAPIResponse<T>;
        if (!res.ok) throw new HTTPError(json.message || 'Unknown error occurred', statusCode);
        return json;
    }

    async list(query?: RequestParamQuery): Promise<GenericAPIResponse<T[]>> {
        const res = await fetch(
            `${this.baseUrl}/${this.endpoint}${query && '?' + stringify(query)}`,
            {
                method: 'GET',
                headers: {
                    'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                    Authorization: this.sessionData.access_token,
                },
            },
        );
        const statusCode = res.status;
        const json = (await res.json()) as GenericAPIResponse<T[]>;
        if (!res.ok) throw new HTTPError(json.message || 'Unknown error occurred', statusCode);
        return json;
    }
}
