import { MutationError } from "@/hooks/useShapes";
import {
    APIResponse,
    LoginResult,
    RefreshTokenResult,
    MeResult,
    GetShapesResult,
    CreateShapeResult,
    UpdateShapeResult
} from "@/lib/types/types";
import { setAccessTokenCookie, getAccessTokenCookie, removeAccessTokenCookie } from "./cookies";

import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const accessToken = getAccessTokenCookie();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only skip retry for auth endpoints
        const shouldRetry =
            !originalRequest.url.includes("/accounts/login/") &&
            !originalRequest.url.includes("/accounts/token/refresh/")

        if (error.response?.status === 401 && !originalRequest._retry && shouldRetry) {
            originalRequest._retry = true;
            const result = await refreshToken();
            if (result.status === 200 && result.access) {
                setAccessTokenCookie(result.access);
                originalRequest.headers.Authorization = `Bearer ${result.access}`;
                return api(originalRequest);
            } else {
                removeAccessTokenCookie()
                // Redirect to login if refresh fails
                window.location.href = "/admin/login";
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export async function apiLogin(
    username: string,
    password: string
): Promise<APIResponse<LoginResult>> {
    try {
        const res = await api.post("/accounts/login/", { username, password });
        return {
            ...res.data,
            status: res.status,
            detail: res.data.detail || "Login successful.",
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return {
                status: error.response.status,
                detail: error.response.data.detail || "Login failed.",
            };
        }
        return {
            status: 500,
            detail: "Unknown error.",
        };
    }
}

export async function apiLogout(): Promise<APIResponse> {
    try {
        const res = await api.post("/accounts/logout/");
        return {
            ...res.data,
            status: res.status,
            detail: res.data.detail || "Logged out.",
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return {
                status: error.response.status,
                detail: error.response.data.detail || "Logout failed.",
            };
        }
        return {
            status: 500,
            detail: "Unknown error.",
        };
    }
}

export async function refreshToken(): Promise<APIResponse<RefreshTokenResult>> {
    try {
        const res = await api.post("/accounts/token/refresh/");
        return {
            ...res.data,
            status: res.status,
            detail: res.data.detail || "Token refreshed.",
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return {
                status: error.response.status,
                detail: error.response.data.detail || "Token refresh failed.",
            };
        }
        return {
            status: 500,
            detail: "Unknown error.",
        };
    }
}

export async function getMe(): Promise<APIResponse<MeResult>> {
    try {
        const res = await api.get("/accounts/me/");
        return {
            user: res.data,
            status: res.status,
            detail: "User info fetched.",
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return {
                status: error.response.status,
                detail: error.response.data.detail || "Failed to fetch user info.",
            };
        }
        return {
            status: 500,
            detail: "Unknown error.",
        };
    }
}

export async function getShapes(): Promise<APIResponse<GetShapesResult>> {
    try {
        const res = await api.get("/shapes/");
        return {
            shapes: res.data,
            status: res.status,
            detail: "Shapes fetched.",
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return {
                status: error.response.status,
                detail: error.response.data.detail || "Failed to fetch shapes.",
            };
        }
        return {
            status: 500,
            detail: "Unknown error.",
        };
    }
}

export async function createShape(
    data: { name: string; shape: string, color: string }
): Promise<APIResponse<CreateShapeResult>> {
    try {
        const res = await api.post("/shapes/", data);
        return {
            shape: res.data,
            status: res.status,
            detail: "Shape created.",
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw {
                status: error.response.status,
                detail: error.response.data.detail || "Failed to create shape.",
            } as MutationError;
        }
        throw {
            status: 500,
            detail: "Unknown error.",
        } as MutationError;
    }
}

export async function updateShape(
    id: number,
    data: { name?: string; shape?: string, color?: string }
): Promise<APIResponse<UpdateShapeResult>> {
    try {
        const res = await api.put(`/shapes/${id}/`, data);
        return {
            shape: res.data,
            status: res.status,
            detail: "Shape updated.",
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw {
                status: error.response.status,
                detail: error.response.data.detail || "Failed to update shape.",
            } as MutationError;
        }
        throw {
            status: 500,
            detail: "Unknown error.",
        } as MutationError;
    }
}

export async function deleteShape(
    id: number
): Promise<APIResponse> {
    try {
        const res = await api.delete(`/shapes/${id}/`);
        return {
            status: res.status,
            detail: "Shape deleted.",
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw {
                status: error.response.status,
                detail: error.response.data.detail || "Failed to delete shape.",
            } as MutationError;
        }
        throw {
            status: 500,
            detail: "Unknown error.",
        } as MutationError;
    }
}
