// You can place these in @/lib/types or directly in the file if this is a standalone utility

export interface FetchAPIParams {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: Record<string, unknown>; // Body will be an object, stringified to JSON
    headers?: Record<string, string>; // Allow custom headers
    token?: string | null;
    requiresAuth?: boolean;
    requiresCSRF?: boolean;
}

// For the error part of the response
export interface APIError {
    message?: string; // General message
    detail?: string;  // Often used by DRF for single string errors
    [field: string]: unknown; // For field-specific errors (like DRF validation)
}

export interface FetchAPIResponse<T = unknown> {
    success: boolean;
    status: number;
    data: T | null;
    error: string | APIError | null; // Error can be a simple string or a structured APIError
}
