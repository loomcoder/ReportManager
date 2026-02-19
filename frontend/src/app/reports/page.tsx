"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Report } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, FileText, RefreshCw, Trash2, Pencil, Download, Upload } from "lucide-react";
import { InsightCard } from "@/components/ai/InsightCard";
import { logger } from "@/lib/logger";

export default function ReportsPage() {
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/reports");
            setReports(response.data);
            setError("");
        } catch (err: any) {
            logger.error("Failed to fetch reports:", err);
            setError("Failed to load reports. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this report?")) return;
        try {
            await api.delete(`/reports/${id}`);
            fetchReports();
        } catch (err: any) {
            logger.error("Failed to delete report:", err);
            alert("Failed to delete report");
        }
    };
    const [analyzingReportId, setAnalyzingReportId] = useState<string | null>(null);
    const [insights, setInsights] = useState<Record<string, string>>({});

    const handleAnalyze = async (report: Report) => {
        setAnalyzingReportId(report.id);
        try {
            const response = await api.post("/ai/analyze", {
                context: "report_summary",
                data: report
            });
            setInsights(prev => ({
                ...prev,
                [report.id]: response.data.result
            }));
        } catch (err) {
            logger.error("Failed to analyze report:", err);
            alert("Failed to generate insights");
        } finally {
            setAnalyzingReportId(null);
        }
    };

    const handleExport = async () => {
        if (selectedReports.size === 0) {
            alert("Please select at least one report to export");
            return;
        }

        setIsExporting(true);
        try {
            const response = await api.get("/reports");
            const allReports = response.data;

            // Filter only selected reports
            const reportsToExport = allReports.filter((r: Report) => selectedReports.has(r.id));

            // Create JSON file
            const dataStr = JSON.stringify(reportsToExport, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });

            // Create download link
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `reports-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            logger.info(`Exported ${reportsToExport.length} report(s)`);
            // Clear selection after export
            setSelectedReports(new Set());
        } catch (err: any) {
            logger.error("Failed to export reports:", err);
            alert("Failed to export reports: " + (err.response?.data?.message || err.message));
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const fileContent = await file.text();
            const reportsData = JSON.parse(fileContent);

            // Validate the data
            if (!Array.isArray(reportsData)) {
                throw new Error("Invalid file format. Expected an array of reports.");
            }

            // Send to backend for import
            const response = await api.post("/reports/import", { reports: reportsData });

            const { imported, updated, skipped } = response.data;
            let message = [];
            if (imported > 0) message.push(`${imported} new report(s)`);
            if (updated > 0) message.push(`${updated} updated`);
            if (skipped > 0) message.push(`${skipped} skipped`);

            alert(`Import complete: ${message.join(', ')}`);
            fetchReports(); // Refresh the list
        } catch (err: any) {
            logger.error("Failed to import reports:", err);
            if (err instanceof SyntaxError) {
                alert("Invalid JSON file. Please check the file format.");
            } else {
                alert("Failed to import reports: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setIsImporting(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const toggleReportSelection = (reportId: string) => {
        setSelectedReports(prev => {
            const newSet = new Set(prev);
            if (newSet.has(reportId)) {
                newSet.delete(reportId);
            } else {
                newSet.add(reportId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedReports.size === reports.length) {
            setSelectedReports(new Set());
        } else {
            setSelectedReports(new Set(reports.map(r => r.id)));
        }
    };

    const isAllSelected = reports.length > 0 && selectedReports.size === reports.length;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting || selectedReports.size === 0}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {isExporting ? "Exporting..." : `Export${selectedReports.size > 0 ? ` (${selectedReports.size})` : ""}`}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {isImporting ? "Importing..." : "Import"}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        style={{ display: "none" }}
                    />
                    <Button variant="outline" size="icon" onClick={fetchReports}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => router.push("/reports/create")}>
                        <Plus className="mr-2 h-4 w-4" /> Create Report
                    </Button>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Reports</CardTitle>
                            <CardDescription>Manage and view your analytics reports.</CardDescription>
                        </div>
                        {reports.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all"
                                    checked={isAllSelected}
                                    onCheckedChange={toggleSelectAll}
                                />
                                <Label htmlFor="select-all" className="text-sm cursor-pointer">
                                    Select All
                                </Label>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No reports found. Create one to get started.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <div key={report.id} className="space-y-2">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3 flex-1">
                                            <Checkbox
                                                id={`report-${report.id}`}
                                                checked={selectedReports.has(report.id)}
                                                onCheckedChange={() => toggleReportSelection(report.id)}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <span
                                                        className="font-medium cursor-pointer hover:underline text-primary"
                                                        onClick={() => router.push(`/reports/${report.id}`)}
                                                    >
                                                        {report.name}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground ml-6">{report.description || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAnalyze(report)}
                                                disabled={analyzingReportId === report.id}
                                            >
                                                {analyzingReportId === report.id ? "Analyzing..." : "Analyze with AI"}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => router.push(`/reports/edit/${report.id}`)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(report.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                    {
                                        insights[report.id] && (
                                            <div className="ml-6">
                                                <InsightCard insight={insights[report.id]} />
                                            </div>
                                        )
                                    }
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
