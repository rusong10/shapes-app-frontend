import { getCookie } from "@/utils/cookies";
import { FetchAPIParams, FetchAPIResponse, APIErrorResponse } from "@/lib/types";

export const FetchAPI = async <T = unknown>({
    url,
    method = "GET",
    body,
    token,
    requiresAuth = true,
    requiresCSRF = false,
    headers = {},
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
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...headers,
    };

    if (requiresAuth && token) {
        finalHeaders["Authorization"] = `Bearer ${token}`;
    }

    if (requiresCSRF) {
        const csrfToken = getCookie("csrftoken");
        if (csrfToken) {
            finalHeaders["X-CSRFToken"] = csrfToken;
        } else if (method !== 'GET') {
            console.warn("CSRF token not found but requiresCSRF is true for a mutating request.");
        }
    }

    const fetchConfig: RequestInit = {
        method,
        headers: finalHeaders,
        credentials: "include",
    };

    if (body && method?.toUpperCase() !== "GET") {
        try {
            fetchConfig.body = JSON.stringify(body);
        } catch (stringifyError) {
            console.error("Error stringifying body:", stringifyError);

            return {
                success: false,
                status: 0,
                data: null,
                error: "Failed to stringify request body.",
            };
        }
    } else if (method?.toUpperCase() === "GET") {
        delete finalHeaders["Content-Type"];
        fetchConfig.headers = finalHeaders;
    }


    try {
        const response = await fetch(url, fetchConfig);

        // Handle 204 No Content separately as it won't have a JSON body
        if (response.status === 204) {
            return {
                success: true,
                status: response.status,
                data: null,
                error: null,
            };
        }

        let responseData: T | APIErrorResponse | null = null;
        let parseErrorOccurred = false;
        try {
            responseData = await response.json();
        } catch (e) {
            parseErrorOccurred = true;
            console.error("Failed to parse JSON response:", e);
        }

        if (!response.ok) {
            let errorPayload: string | APIErrorResponse = `Request failed with status ${response.status}.`;
            if (responseData && typeof responseData === "object" && !parseErrorOccurred) {
                errorPayload = responseData as APIErrorResponse;
            } else if (parseErrorOccurred) {
                errorPayload = `Request failed with status ${response.status} and error response was not valid JSON.`;
            }
            return {
                success: false,
                status: response.status,
                data: null,
                error: errorPayload,
            };
        }

        // If response.ok but JSON parsing failed
        if (parseErrorOccurred) {
            return {
                success: false,
                status: response.status,
                data: null,
                error: "Response was successful (2xx) but failed to parse JSON body.",
            };
        }

        return {
            success: true,
            status: response.status,
            data: responseData as T,
            error: null,
        };

    } catch (networkError: unknown) {
        let errorMessage = "Network error occurred.";
        if (networkError instanceof Error) {
            errorMessage = networkError.message;
        } else if (typeof networkError === "string") {
            errorMessage = networkError;
        } else {
            console.error("Non-standard network error:", networkError);
        }
        return {
            success: false,
            status: 0,
            data: null,
            error: errorMessage,
        };
    }
};
