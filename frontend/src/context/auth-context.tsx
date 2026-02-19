"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/api";

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
    permissions?: string[];
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
    hasPermission: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    // Fetch user details or use decoded data if sufficient
                    // For now, we'll assume we need to fetch user details or persist them
                    // Ideally, we should fetch /me here
                    api
                        .get("/me")
                        .then((res) => {
                            setUser(res.data);
                            setLoading(false);
                        })
                        .catch(() => {
                            logout();
                            setLoading(false);
                        });
                }
            } catch (error) {
                logout();
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        setUser(userData);
        router.push("/");
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login");
    };

    const hasPermission = (module: string) => {
        if (!user) return false;

        // ADMIN role bypasses all checks
        if (user.roles?.includes("ADMIN")) return true;

        if (!user.permissions) return false;
        return user.permissions.includes(module);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
                loading,
                hasPermission,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
