import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';

export interface DataService<T> {
    get(id: string): Promise<GenericAPIResponse<T>>;
    list(query?: RequestParamQuery): Promise<GenericAPIResponse<T[]>>;
    create(data: any): Promise<GenericAPIResponse<T>>;
    update(id: string, data: any): Promise<GenericAPIResponse<T>>;
    delete(id: string): Promise<void>;
}
