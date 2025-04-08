import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { stringify } from '../utils/string';
import { DataService } from './DataService';
import { SessionData } from '@/components/Auth/schema';

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
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                Authorization: this.sessionData.access_token,
            },
        });
        const statusCode = res.status;
        const json = (await res.json()) as GenericAPIResponse<T>;
        if (!res.ok) {
            const err = new Error(json.message || 'Unknown error occurred');
            // @ts-ignore
            err.statusCode = statusCode;
            throw err;
        }
        return json;
    }

    async list(query?: RequestParamQuery): Promise<GenericAPIResponse<T[]>> {
        console.log('LIST');
        const res = await fetch(
            `${this.baseUrl}/${this.endpoint}${query && '?' + stringify(query)}`,
            {
                headers: {
                    'x-api-key': process.env.EXPO_PUBLIC_API_KEY as string,
                    Authorization: this.sessionData.access_token,
                },
            },
        );
        const statusCode = res.status;
        console.log(res);
        const json = (await res.json()) as GenericAPIResponse<T[]>;
        if (!res.ok) {
            const err = new Error(json.message || 'Unknown error occurred');
            // @ts-ignore
            err.statusCode = statusCode;
            throw err;
        }
        return json;
    }
}
