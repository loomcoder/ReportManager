"use client";

import Link from "next/link";
import { LayoutDashboard, FileText, Database, Settings, LogOut, CalendarClock, Users, Bot, PieChart, Calendar, Shield, MessageSquare, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

import { useAuth } from "@/context/auth-context";

export function Sidebar({ className }: SidebarProps) {
    const { logout, user, hasPermission } = useAuth();

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Overview
                    </h2>
                    <div className="space-y-1">
                        {hasPermission("VIEW_DASHBOARD") && (
                            <Button variant="secondary" className="w-full justify-start" asChild>
                                <Link href="/">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        )}
                        {hasPermission("VIEW_REPORTS") && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/reports">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Reports
                                </Link>
                            </Button>
                        )}
                        {hasPermission("VIEW_DASHBOARD") && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/dashboards">
                                    <PieChart className="mr-2 h-4 w-4" />
                                    Dashboards
                                </Link>
                            </Button>
                        )}
                        {hasPermission("VIEW_DATA_SOURCES") && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/data-sources">
                                    <Database className="mr-2 h-4 w-4" />
                                    Data Sources
                                </Link>
                            </Button>
                        )}
                        {hasPermission("VIEW_SCHEDULES") && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/schedules">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Schedules
                                </Link>
                            </Button>
                        )}
                        {hasPermission("VIEW_LLM") && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/llm">
                                    <Bot className="mr-2 h-4 w-4" />
                                    LLM Management
                                </Link>
                            </Button>
                        )}
                        {hasPermission("VIEW_CHAT") && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/chat">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Chat
                                </Link>
                            </Button>
                        )}
                        {hasPermission("VIEW_AI_INSIGHTS") && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/ai-insights">
                                    <Bot className="mr-2 h-4 w-4" />
                                    AI Insights
                                </Link>
                            </Button>
                        )}
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/analytics">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Analytics
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Settings
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/report-setup">
                                <FileText className="mr-2 h-4 w-4" />
                                Report Setup
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </Button>
                        {hasPermission("MANAGE_USERS") && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/admin/users">
                                    <Users className="mr-2 h-4 w-4" />
                                    Users
                                </Link>
                            </Button>
                        )}
                        {hasPermission("MANAGE_ROLES") && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/admin/roles">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Roles
                                </Link>
                            </Button>
                        )}
                        {hasPermission("MANAGE_MODULES") && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/admin/modules">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Modules
                                </Link>
                            </Button>
                        )}
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100" onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
