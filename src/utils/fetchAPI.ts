import { getCookie } from '@/utils/cookies';
import { FetchAPIParams, FetchAPIResponse } from '@/lib/types';

export const FetchAPI = async <T = any>({
    url,
    method = 'GET',
    body,
    headers = {},
    token,
    requiresAuth = true,
    requiresCSRF = false,
}: FetchAPIParams): Promise<FetchAPIResponse<T>> => {
    if (!url) {
        return {
            success: false,
            status: 0,
            data: null,
            error: "API URL not specified.",
        };
    }

    const finalHeaders: Record<string, string> = {
        Accept: 'application/json',
        ...(headers || {}),
    };

    if (requiresAuth && token) {
        finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (requiresCSRF) {
        const csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            finalHeaders['X-CSRFToken'] = csrfToken;
        }
    }

    const fetchConfig: RequestInit = {
        method,
        headers: finalHeaders,
        credentials: 'include',
    };

    if (body && method.toUpperCase() !== 'GET') {
        fetchConfig.body = JSON.stringify(body);
        finalHeaders['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, fetchConfig);

        const contentType = response.headers.get('content-type');
        const isJSON = contentType?.includes('application/json');

        let data: any;
        try {
            if (isJSON) {
                data = await response.json();
            } else if (contentType?.includes('text/')) {
                data = await response.text();
            } else if (response.status === 204) {
                data = null;
            } else {
                data = await response.text();
            }
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            data = null;
        }

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                data: null,
                error: isJSON && typeof data === 'object'
                    ? data.detail || data.message || JSON.stringify(data)
                    : typeof data === 'string'
                        ? data
                        : `Request failed with status ${response.status}`,
            };
        }

        return {
            success: true,
            status: response.status,
            data: data as T,
            error: null,
        };
    } catch (error: any) {
        return {
            success: false,
            status: 0,
            data: null,
            error: error?.message || 'Network error occurred.',
        };
    }
};