export type GenericAPIResponse<T> = {
    status: number;
    message: string;
    data: T;
    page: number;
    page_size: number;
    total: number;
    total_items: number;
};
