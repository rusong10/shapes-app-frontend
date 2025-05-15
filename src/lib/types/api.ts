
export interface FetchAPIParams<B = unknown> {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: B | FormData;
    headers?: Record<string, string>;
    token?: string | null;
    requiresAuth?: boolean;
    requiresCSRF?: boolean;
}

export interface APIErrorResponse {
    message?: string;
    detail?: string;
    [field: string]: unknown;
}

export interface FetchAPIResponse<T = unknown> {
    success: boolean;
    status: number;
    data: T | null;
    error: string | APIErrorResponse | null;
}
