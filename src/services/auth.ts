import { FetchAPI } from "@/utils/fetchAPI";
import api from "@/config/api";
import { AuthTokens, FetchAPIResponse } from "@/lib/types";

export const login = (data: { username: string; password: string }) => {
    return FetchAPI<AuthTokens>({
        url: api.LOGIN,
        method: "POST",
        body: data
    });
};

export const logout = (token: string | null): Promise<FetchAPIResponse<null>> => {
    return FetchAPI({
        url: api.LOGOUT,
        method: "POST",
        token: token,
        requiresAuth: true,
        requiresCSRF: true
    });
};

export const refresh = (): Promise<FetchAPIResponse<AuthTokens>> => {
    return FetchAPI({
        url: api.TOKEN_REFRESH,
        method: "POST",
        requiresCSRF: true
    });
};

export const verify = (token: string): Promise<FetchAPIResponse<{ detail: string }>> => {
    return FetchAPI({
        url: api.TOKEN_VERIFY,
        method: "POST",
        body: { token }
    });
};
