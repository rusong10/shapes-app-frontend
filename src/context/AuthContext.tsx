"use client"

import { apiLogin, apiLogout, refreshToken } from "@/utils/api";
import { setAccessTokenCookie, removeAccessTokenCookie } from "@/utils/cookies"
import { createContext, ReactNode, useContext, useEffect, useRef } from "react";
import { LoginResult, APIResponse, LoginCredentials } from "@/lib/types/types";
import { usePathname, useRouter } from "next/navigation";

type AuthContextType = {
    login: (data: LoginCredentials) => Promise<APIResponse<LoginResult>>;
    logout: () => Promise<APIResponse>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter()
    const pathname = usePathname()

    const firstLoginRef = useRef(false);
    const logoutChannel = new BroadcastChannel("auth");

    useEffect(() => {
        const refresh = async () => {
            if (pathname !== "/admin/login") {
                if (firstLoginRef.current) {
                    // Skip refresh on first load after login
                    firstLoginRef.current = false;
                    return;
                }

                const result = await refreshToken();

                if (result.status === 200 && result.access) {
                    setAccessTokenCookie(result.access);
                } else {
                    removeAccessTokenCookie();
                    router.push("/admin/login");
                }
            }
        }

        refresh()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    useEffect(() => {
        logoutChannel.onmessage = (event) => {
            if (event.data === "logout") {
                removeAccessTokenCookie();
                router.push("/admin/login");
            }
        };
        return () => {
            logoutChannel.close();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (data: LoginCredentials): Promise<APIResponse<LoginResult>> => {
        const result = await apiLogin(data.username, data.password);

        if (result.status === 200 && result.access && result.user) {
            setAccessTokenCookie(result.access)
            firstLoginRef.current = true;
            router.push("/admin")
        }

        return result;
    };

    const logout = async (): Promise<APIResponse> => {
        const result = await apiLogout();

        if (result.status === 200) {
            removeAccessTokenCookie()
            logoutChannel.postMessage("logout");
            router.push("/admin/login")
        }

        return result;
    };

    return (
        <AuthContext.Provider value={{ login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context
}