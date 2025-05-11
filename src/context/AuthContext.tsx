"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from 'next/navigation';
import * as authService from "@/services/auth";
import { LoginCredentials } from "@/lib/types";

interface AuthContextType {
    accessToken: string | null;
    username: string | null;
    isAuthenticated: boolean;
    login: (data: LoginCredentials) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const isAuthenticated = !!accessToken;

    // On mount, check token validity
    useEffect(() => {
        const checkToken = async () => {
            setLoading(true);
            const storedToken = localStorage.getItem("accessToken");
            const storedUsername = localStorage.getItem("username");
            if (storedToken) {
                // Verify the token
                const res = await authService.verify(storedToken);
                if (res.success) {
                    console.log('sucess validate token')
                    setAccessToken(storedToken);
                    if (storedUsername) setUsername(storedUsername);
                } else {
                    console.log('tryyyyy')
                    // Try to refresh
                    const refreshRes = await authService.refresh();
                    if (refreshRes.success && refreshRes.data?.access) {
                        setAccessToken(refreshRes.data.access);
                        localStorage.setItem("accessToken", refreshRes.data.access);
                        if (storedUsername) setUsername(storedUsername);
                    } else {
                        setAccessToken(null);
                        setUsername(null);
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("username");
                        router.push('/login');
                    }
                }
            }
            setLoading(false);
        };
        checkToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (data: LoginCredentials): Promise<boolean> => {
        try {
            const res = await authService.login(data);
            if (res.success && res.data?.access) {
                setAccessToken(res.data.access);
                setUsername(data.username);
                localStorage.setItem("accessToken", res.data.access);
                localStorage.setItem("username", data.username);

                document.cookie = `accessToken=${res.data.access}; path=/; max-age=3600;`;
                return true;
            }
            return false;
        } catch (err) {
            console.error("Login failed", err);
            return false;
        }
    };

    const logout = async () => {
        try {
            await authService.logout(accessToken);
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setAccessToken(null);
            setUsername(null);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("username");

            document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            router.push('/login');
        }
    };

    const refreshAccessToken = async () => {
        try {
            const res = await authService.refresh();
            if (res.success && res.data?.access) {
                setAccessToken(res.data.access);
                localStorage.setItem("accessToken", res.data.access);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Token refresh failed", err);
            return false;
        }
    };

    // auto-refresh the access token every 10 minutes
    useEffect(() => {
        if (!accessToken) return;
        const interval = setInterval(() => {
            refreshAccessToken();
        }, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [accessToken]);

    // block rendering until auth is checked
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                username,
                isAuthenticated,
                login,
                logout,
                refreshAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
