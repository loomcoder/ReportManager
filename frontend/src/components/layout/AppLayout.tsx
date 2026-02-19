"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    const isAuthPage = pathname === "/login" || pathname === "/register";
    const isChatPage = pathname?.startsWith("/chat");

    useEffect(() => {
        if (!loading && !isAuthenticated && !isAuthPage) {
            router.push("/login");
        }
    }, [loading, isAuthenticated, isAuthPage, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isAuthPage) {
        return <main className="flex-1 min-h-screen flex flex-col">{children}</main>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className={`flex flex-col ${isChatPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
            <div className="flex-1 flex overflow-hidden">
                <aside className="w-64 border-r bg-muted/40 hidden md:block overflow-y-auto">
                    <Sidebar />
                </aside>
                <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className={`flex-1 ${isChatPage ? 'p-0 overflow-hidden' : 'p-6'}`}>{children}</main>
                </div>
            </div>
        </div>
    );
}
