export interface DRFError {
    [field: string]: string[] | string;
}

export interface FetchAPIParams {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: Record<string, any> | FormData;
    headers?: Record<string, string>;
    token?: string | null;
    requiresAuth?: boolean;
    requiresCSRF?: boolean;
    isFormData?: boolean;
}

export interface FetchAPIResponse<T = unknown> {
    success: boolean;
    status: number;
    data: T | null;
    error: string | DRFError | null;
}