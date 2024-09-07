export type GenericAPIResponse<T> = {
    status: number;
    message: string;
    data: T;
    page: number;
    page_size: number;
    total: number;
    total_items: number;
}

export type Session = {
    access_token: string;
    access_token_expires_at: string;
    refresh_token: string;
    refresh_token_expires_at: string;
}
