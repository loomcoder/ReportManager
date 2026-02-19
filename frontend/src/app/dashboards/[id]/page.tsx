"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Dashboard, Report } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ReportWidget } from "@/components/charts/ReportWidget";

interface Widget {
    id: string;
    reportId: string;
    reportName: string;
    type: "chart" | "table";
}

export default function DashboardDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [dashboard, setDashboard] = useState<Dashboard | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Add Widget State
    const [selectedReportId, setSelectedReportId] = useState("");
    const [selectedType, setSelectedType] = useState<"chart" | "table">("chart");

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [dashboardRes, reportsRes] = await Promise.all([
                    api.get(`/dashboards/${id}`),
                    api.get("/reports")
                ]);
                setDashboard(dashboardRes.data);
                setReports(reportsRes.data);

                // Parse layout
                try {
                    const layout = JSON.parse(dashboardRes.data.layout || "[]");
                    setWidgets(layout);
                } catch (e) {
                    setWidgets([]);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                alert("Failed to load dashboard");
                router.push("/dashboards");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, router]);

    const handleAddWidget = () => {
        if (!selectedReportId) return;

        const report = reports.find(r => r.id === selectedReportId);
        if (!report) return;

        const newWidget: Widget = {
            id: crypto.randomUUID(),
            reportId: report.id,
            reportName: report.name,
            type: selectedType
        };

        setWidgets([...widgets, newWidget]);
        setSelectedReportId("");
    };

    const handleRemoveWidget = (widgetId: string) => {
        setWidgets(widgets.filter(w => w.id !== widgetId));
    };

    const handleSave = async () => {
        if (!dashboard) return;
        setIsSaving(true);
        try {
            await api.put(`/dashboards/${id}`, {
                layout: widgets
            });
            alert("Dashboard saved successfully!");
        } catch (err) {
            console.error("Failed to save dashboard:", err);
            alert("Failed to save dashboard");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (!dashboard) {
        return <div>Dashboard not found</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center space-x-4">
                    <Link href="/dashboards">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{dashboard.name}</h2>
                        <p className="text-muted-foreground">{dashboard.description}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Layout"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Layout</CardTitle>
                        <CardDescription>Preview of your dashboard widgets.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {widgets.length === 0 ? (
                            <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
                                <div className="text-center text-muted-foreground">
                                    No widgets added. Add a report from the panel on the right.
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {widgets.map((widget) => (
                                    <Card key={widget.id} className="relative">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-medium">
                                                    {widget.reportName}
                                                </CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleRemoveWidget(widget.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="h-[300px] p-4">
                                            <ReportWidget
                                                reportId={widget.reportId}
                                                type={widget.type}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Add Widget</CardTitle>
                        <CardDescription>Add a report to your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Report</label>
                            <Select value={selectedReportId} onValueChange={setSelectedReportId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a report" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reports.map((report) => (
                                        <SelectItem key={report.id} value={report.id}>
                                            {report.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Widget Type</label>
                            <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="chart">Chart</SelectItem>
                                    <SelectItem value="table">Table</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full" onClick={handleAddWidget} disabled={!selectedReportId}>
                            <Plus className="mr-2 h-4 w-4" /> Add Widget
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
