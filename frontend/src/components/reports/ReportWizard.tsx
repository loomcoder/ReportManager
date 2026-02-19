"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Save, Database, FileSpreadsheet, Play, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface DataSource {
    id: string;
    name: string;
    type: string;
    connectionType: string;
    fileMetadata?: {
        sheetName?: string;
    };
    config?: {
        tableName?: string;
    };
}

interface ReportWizardProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ReportWizard({ initialData, isEditing = false }: ReportWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDataSources, setIsLoadingDataSources] = useState(true);
    const [dataSources, setDataSources] = useState<DataSource[]>([]);

    // Form State
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [reportType, setReportType] = useState(initialData?.config?.type || "table");
    const [sourceId, setSourceId] = useState(initialData?.sourceId || "");

    // Config State
    const [query, setQuery] = useState(initialData?.config?.query || "");
    const [sheetName, setSheetName] = useState(initialData?.config?.sheetName || "");
    const [xAxis, setXAxis] = useState(initialData?.config?.xAxis || "");
    const [yAxis, setYAxis] = useState(initialData?.config?.yAxis || "");
    const [columns, setColumns] = useState<string[]>([]);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(initialData?.config?.selectedColumns || []);
    const [aggregates, setAggregates] = useState<Record<string, string>>(initialData?.config?.aggregates || {});

    // Preview State
    const [previewData, setPreviewData] = useState<{ columns: string[], rows: any[] } | null>(null);
    const [previewError, setPreviewError] = useState("");

    useEffect(() => {
        fetchDataSources();
    }, []);

    const fetchDataSources = async () => {
        setIsLoadingDataSources(true);
        try {
            const response = await api.get("/data-sources");
            setDataSources(response.data);
        } catch (err) {
            console.error("Failed to fetch data sources:", err);
        } finally {
            setIsLoadingDataSources(false);
        }
    };

    const fetchColumns = async () => {
        if (!sourceId) return;
        try {
            const response = await api.post("/data-sources/columns", {
                sourceId,
                config: {
                    query,
                    sheetName
                }
            });
            setColumns(response.data.columns || []);
        } catch (err) {
            console.error("Failed to fetch columns:", err);
            // Fallback or error handling
        }
    };

    useEffect(() => {
        if (step === 3) {
            fetchColumns();
        }
    }, [step, sourceId, query, sheetName]);

    const selectedSource = dataSources.find(ds => ds.id === sourceId);

    const handlePreview = async () => {
        if (!selectedSource) return;
        setIsLoading(true);
        setPreviewError("");
        setPreviewData(null);

        try {
            // We'll use the run endpoint logic or a specific preview endpoint
            // For now, let's simulate a preview by calling the preview endpoint with current config
            const config: any = {};
            if (selectedSource.type === 'postgres' || selectedSource.type === 'mysql') {
                config.query = query;
                // If no query but table selected in source, use that (simple logic)
                if (!query && selectedSource.connectionType === 'table' && selectedSource.config?.tableName) {
                    // This logic should ideally be handled by backend or user should explicitly write query
                    // For wizard, we enforce writing query or selecting table if we add that UI
                }
            } else if (selectedSource.type === 'excel') {
                config.sheetName = sheetName;
            }

            // Construct payload for preview
            // Note: The existing preview endpoint expects full connection config, 
            // but here we are using an existing source. 
            // We might need to adjust backend to preview from existing source ID, 
            // or just rely on the fact that we are "configuring" the report.

            // Actually, let's use the run endpoint if we are editing, or just mock it for now 
            // since we don't have a "preview from source id" endpoint yet.
            // Wait, we can use the `POST /data-sources/preview` but we need to pass the full config from the source.
            // This is a bit complex because we don't have the full source config (passwords are hidden).

            // BETTER APPROACH: Just save and run? No, wizard needs preview.
            // Let's assume for now we just show a placeholder or basic validation.
            // OR, we can implement a `POST /reports/preview` that takes the report config and runs it.
            // Since we didn't implement that, let's try to use the `run` endpoint if it's an existing report,
            // or just skip real preview for now and focus on saving.

            // Let's implement a simple "Test Configuration" that just checks if fields are filled.
            if (selectedSource.type === 'postgres' && !query) {
                throw new Error("Please enter a SQL query");
            }

            // Call backend for preview
            // For chart reports, derive selectedColumns and aggregates from xAxis/yAxis
            let previewSelectedColumns = selectedColumns;
            let previewAggregates = aggregates;

            if (reportType !== 'table' && xAxis && yAxis) {
                // For charts, we need both xAxis and yAxis columns
                previewSelectedColumns = [xAxis, yAxis];
                // Apply the aggregate to the Y-Axis column
                if (aggregates[yAxis]) {
                    previewAggregates = { [yAxis]: aggregates[yAxis] };
                }
            }

            const payload = {
                sourceId,
                config: {
                    type: reportType,
                    sourceType: selectedSource?.type,
                    query,
                    sheetName,
                    xAxis,
                    yAxis,
                    selectedColumns: previewSelectedColumns,
                    aggregates: previewAggregates
                }
            };

            const response = await api.post("/reports/preview", payload);
            setPreviewData(response.data.data);

        } catch (err: any) {
            setPreviewError(err.response?.data?.message || err.message || "Failed to load preview");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name || !sourceId) {
            alert("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            // For chart reports, derive selectedColumns and aggregates from xAxis/yAxis
            // This ensures the saved report has the correct aggregation settings
            let saveSelectedColumns = selectedColumns;
            let saveAggregates = aggregates;

            if (reportType !== 'table' && xAxis && yAxis) {
                // For charts, we need both xAxis and yAxis columns
                saveSelectedColumns = [xAxis, yAxis];
                // Apply the aggregate to the Y-Axis column
                if (aggregates[yAxis]) {
                    saveAggregates = { [yAxis]: aggregates[yAxis] };
                }
            }

            const payload = {
                name,
                description,
                sourceId,
                config: {
                    type: reportType,
                    sourceType: selectedSource?.type,
                    query,
                    sheetName,
                    xAxis,
                    yAxis,
                    selectedColumns: saveSelectedColumns,
                    aggregates: saveAggregates
                }
            };

            if (isEditing && initialData?.id) {
                await api.put(`/reports/${initialData.id}`, payload);
            } else {
                await api.post("/reports", payload);
            }
            router.push("/reports");
        } catch (err) {
            console.error("Failed to save report:", err);
            alert("Failed to save report");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{isEditing ? "Edit Report" : "Create New Report"}</h1>
                <p className="text-muted-foreground">Follow the steps to configure your report</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center mb-8 space-x-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`flex items-center ${step >= s ? "text-primary" : "text-muted-foreground"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 ${step >= s ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>
                            {s}
                        </div>
                        <span className="font-medium">
                            {s === 1 ? "Details" : s === 2 ? "Data Source" : "Configuration"}
                        </span>
                        {s < 3 && <div className="w-12 h-0.5 bg-border mx-4" />}
                    </div>
                ))}
            </div>

            <Card>
                <CardContent className="pt-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Report Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Monthly Sales" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the report" />
                            </div>
                            <div className="space-y-2">
                                <Label>Report Type</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['table', 'bar', 'line', 'pie'].map((type) => (
                                        <div
                                            key={type}
                                            className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${reportType === type ? "border-primary bg-primary/5" : ""}`}
                                            onClick={() => setReportType(type)}
                                        >
                                            <div className="capitalize font-medium text-center">{type} Chart</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Data Source</Label>
                                {isLoadingDataSources ? (
                                    <div className="text-center py-8 text-muted-foreground">Loading data sources...</div>
                                ) : dataSources.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No data sources available. Please create a data source first.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {dataSources.map((ds) => (
                                            <div
                                                key={ds.id}
                                                className={`border rounded-lg p-4 cursor-pointer hover:border-primary flex items-center space-x-4 ${sourceId === ds.id ? "border-primary bg-primary/5" : ""}`}
                                                onClick={() => setSourceId(ds.id)}
                                            >
                                                <div className="p-2 bg-muted rounded-full">
                                                    {ds.type === 'excel' || ds.type === 'csv' ? <FileSpreadsheet className="h-6 w-6" /> : <Database className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{ds.name}</div>
                                                    <div className="text-sm text-muted-foreground capitalize">{ds.type}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            {selectedSource?.type === 'excel' && (
                                <div className="space-y-2">
                                    <Label htmlFor="sheet">Sheet Name</Label>
                                    <Input
                                        id="sheet"
                                        value={sheetName}
                                        onChange={(e) => setSheetName(e.target.value)}
                                        placeholder={selectedSource.fileMetadata?.sheetName || "Sheet1"}
                                    />
                                </div>
                            )}

                            {(selectedSource?.type === 'postgres' || selectedSource?.type === 'mysql') && (
                                <div className="space-y-2">
                                    <Label htmlFor="query">SQL Query</Label>
                                    <Textarea
                                        id="query"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="SELECT * FROM table_name"
                                        className="font-mono"
                                        rows={5}
                                    />
                                </div>
                            )}

                            {reportType !== 'table' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="xaxis">X-Axis Field</Label>
                                        <Select value={xAxis} onValueChange={setXAxis}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select column" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {columns.map(col => (
                                                    <SelectItem key={col} value={col}>{col}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="yaxis">Y-Axis Field</Label>
                                        <div className="flex space-x-2">
                                            <Select value={yAxis} onValueChange={setYAxis}>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Select column" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {columns.map(col => (
                                                        <SelectItem key={col} value={col}>{col}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select
                                                value={aggregates[yAxis] || ""}
                                                onValueChange={(val) => setAggregates(prev => ({ ...prev, [yAxis]: val }))}
                                                disabled={!yAxis}
                                            >
                                                <SelectTrigger className="w-[100px]">
                                                    <SelectValue placeholder="Agg" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SUM">Sum</SelectItem>
                                                    <SelectItem value="AVG">Avg</SelectItem>
                                                    <SelectItem value="COUNT">Count</SelectItem>
                                                    <SelectItem value="MIN">Min</SelectItem>
                                                    <SelectItem value="MAX">Max</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {reportType === 'table' && columns.length > 0 && (
                                <div className="space-y-4 border rounded-lg p-4">
                                    <Label>Select Columns & Aggregates</Label>
                                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                                        {columns.map(col => (
                                            <div key={col} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`col-${col}`}
                                                        checked={selectedColumns.includes(col)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedColumns([...selectedColumns, col]);
                                                            } else {
                                                                setSelectedColumns(selectedColumns.filter(c => c !== col));
                                                                const newAggs = { ...aggregates };
                                                                delete newAggs[col];
                                                                setAggregates(newAggs);
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`col-${col}`} className="cursor-pointer">{col}</Label>
                                                </div>
                                                {selectedColumns.includes(col) && (
                                                    <Select
                                                        value={aggregates[col] || ""}
                                                        onValueChange={(val) => {
                                                            const newAggs = { ...aggregates };
                                                            if (val && val !== "none") {
                                                                newAggs[col] = val;
                                                            } else {
                                                                delete newAggs[col];
                                                            }
                                                            setAggregates(newAggs);
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-8 w-[100px]">
                                                            <SelectValue placeholder="None" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">None</SelectItem>
                                                            <SelectItem value="SUM">Sum</SelectItem>
                                                            <SelectItem value="AVG">Avg</SelectItem>
                                                            <SelectItem value="COUNT">Count</SelectItem>
                                                            <SelectItem value="MIN">Min</SelectItem>
                                                            <SelectItem value="MAX">Max</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button variant="outline" onClick={handlePreview} disabled={isLoading}>
                                    <Play className="mr-2 h-4 w-4" /> Test Configuration
                                </Button>
                            </div>

                            {previewError && (
                                <div className="text-red-500 text-sm mt-2">{previewError}</div>
                            )}

                            {previewData && (
                                <div className="mt-4 border rounded-lg overflow-hidden">
                                    <div className="bg-muted p-2 text-sm font-medium">Preview Data</div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {previewData.columns.map((col) => (
                                                    <TableHead key={col}>{col}</TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {previewData.rows.map((row, i) => (
                                                <TableRow key={i}>
                                                    {previewData.columns.map((col) => (
                                                        <TableCell key={col}>{row[col]}</TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> {step > 1 ? "Back" : "Cancel"}
                    </Button>

                    {step < 3 ? (
                        <Button type="button" onClick={() => setStep(step + 1)} disabled={(step === 1 && !name) || (step === 2 && !sourceId)}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleSave} disabled={isLoading}>
                            <Save className="mr-2 h-4 w-4" /> Save Report
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
