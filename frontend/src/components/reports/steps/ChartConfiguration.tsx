import React, { useState, useEffect } from 'react';
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChartType } from './ChartTypeSelection';
import { DataTableRenderer } from '../charts/DataTableRenderer';
import { Play } from "lucide-react";

interface ChartConfigurationProps {
    sourceId: string;
    chartType: ChartType;
    subType: string;
    onConfigChange: (config: any) => void;
}

export const ChartConfiguration: React.FC<ChartConfigurationProps> = ({ sourceId, chartType, subType, onConfigChange }) => {
    // Data Source Details
    const [sourceType, setSourceType] = useState<string>("");

    // Data Source Config
    const [query, setQuery] = useState("");
    const [sheetName, setSheetName] = useState("");

    // Data & Columns
    const [columns, setColumns] = useState<string[]>([]);
    const [previewRows, setPreviewRows] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Chart Config
    const [xAxis, setXAxis] = useState("");
    const [yAxis, setYAxis] = useState("");
    const [secondaryXAxis, setSecondaryXAxis] = useState("");
    const [aggregates, setAggregates] = useState<Record<string, string>>({});
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

    // Fetch Source Type
    useEffect(() => {
        const fetchSourceDetails = async () => {
            if (!sourceId) return;
            try {
                const response = await api.get("/data-sources");
                const source = response.data.data.find((s: any) => s.id === parseInt(sourceId) || s.id === sourceId);
                if (source) setSourceType(source.type);
            } catch (err) {
                console.error("Failed to fetch source details:", err);
            }
        };
        fetchSourceDetails();
    }, [sourceId]);

    // Fetch Data & Columns
    const handleFetchData = async () => {
        if (!sourceId) return;
        setIsLoadingData(true);
        try {
            // Fetch Columns
            const colResponse = await api.post("/data-sources/columns", {
                sourceId,
                config: { query, sheetName }
            });
            setColumns(colResponse.data.columns || []);

            // Fetch Preview Data (Reuse preview endpoint or just use the columns endpoint if it returns rows? 
            // Usually columns endpoint just returns columns. We intentionally want to see data.
            // Let's use the preview endpoint from NewReportWizard here too for consistency.
            const dataResponse = await api.post("/reports/preview", {
                sourceId,
                config: {
                    type: 'datatable', // Force datatable for raw view
                    query,
                    sheetName
                }
            });
            setPreviewRows(dataResponse.data.data.rows || []);

        } catch (err) {
            console.error("Failed to fetch data:", err);
            alert("Failed to fetch data. Please check your query or sheet name.");
        } finally {
            setIsLoadingData(false);
        }
    };

    // Update parent config
    useEffect(() => {
        onConfigChange({
            query,
            sheetName,
            xAxis,
            yAxis,
            secondaryXAxis,
            aggregates,
            selectedColumns
        });
    }, [query, sheetName, xAxis, yAxis, secondaryXAxis, aggregates, selectedColumns]);

    const handleAggregateChange = (col: string, agg: string) => {
        setAggregates(prev => {
            const newAggs = { ...prev };
            if (agg && agg !== "none") {
                newAggs[col] = agg;
            } else {
                delete newAggs[col];
            }
            return newAggs;
        });
    };

    const isSqlSource = ['postgres', 'mysql', 'sqlite', 'mariadb'].includes(sourceType);
    const isFileSource = ['excel', 'csv', 'spreadsheet'].includes(sourceType);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Configure {chartType} Chart</h2>
                <p className="text-muted-foreground">Retrieve data and map it to the chart axes.</p>
            </div>

            {/* 1. Data Retrieval */}
            <div className="space-y-4 border p-4 rounded-md bg-muted/5">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">1. Data Retrieval</Label>

                <div className="space-y-4">
                    {/* Dynamic Inputs */}
                    {isSqlSource && (
                        <div className="space-y-2">
                            <Label htmlFor="query">SQL Query</Label>
                            <Textarea
                                id="query"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="SELECT date, category, amount FROM sales"
                                className="font-mono"
                                rows={4}
                            />
                        </div>
                    )}

                    {(isFileSource || !sourceType) && !isSqlSource && (
                        <div className="space-y-2">
                            <Label htmlFor="sheet">Sheet Name (for Excel)</Label>
                            <Input
                                id="sheet"
                                value={sheetName}
                                onChange={(e) => setSheetName(e.target.value)}
                                placeholder="Sheet1"
                            />
                            {!sourceType && <p className="text-xs text-muted-foreground">Source type unknown, showing default inputs.</p>}
                        </div>
                    )}

                    <Button onClick={handleFetchData} disabled={isLoadingData} size="sm">
                        <Play className="mr-2 h-4 w-4" /> {isLoadingData ? "Loading..." : "Run Query & Load Data"}
                    </Button>
                </div>
            </div>

            {/* 2. Data Preview */}
            {previewRows.length > 0 && (
                <div className="space-y-4 border p-4 rounded-md">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">2. Data Preview</Label>
                    <div className="max-h-[200px] overflow-auto border rounded bg-white">
                        <DataTableRenderer data={previewRows} config={{}} type="datatable" />
                    </div>
                </div>
            )}

            {/* 3. Chart Mapping */}
            {(columns.length > 0) && (
                <div className="space-y-4 border p-4 rounded-md bg-muted/5">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">3. Chart Mapping</Label>

                    {/* Bar / Line / Scatter */}
                    {(['bar', 'line', 'scatter'].includes(chartType)) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>X-Axis (Dimension)</Label>
                                <Select value={xAxis} onValueChange={setXAxis}>
                                    <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                                    <SelectContent>{columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Y-Axis (Metric)</Label>
                                <div className="flex gap-2">
                                    <Select value={yAxis} onValueChange={setYAxis}>
                                        <SelectTrigger className="flex-1"><SelectValue placeholder="Select column" /></SelectTrigger>
                                        <SelectContent>{columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Select value={aggregates[yAxis] || ""} onValueChange={(val) => handleAggregateChange(yAxis, val)}>
                                        <SelectTrigger className="w-[100px]"><SelectValue placeholder="Agg" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="SUM">Sum</SelectItem>
                                            <SelectItem value="AVG">Avg</SelectItem>
                                            <SelectItem value="COUNT">Count</SelectItem>
                                            <SelectItem value="MIN">Min</SelectItem>
                                            <SelectItem value="MAX">Max</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {(chartType === 'bar' && (subType === 'grouped' || subType === 'stacked' || subType === 'horizontal_stacked')) && (
                                <div className="space-y-2">
                                    <Label>Group By (Optional)</Label>
                                    <Select value={secondaryXAxis} onValueChange={setSecondaryXAxis}>
                                        <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pie Chart */}
                    {chartType === 'pie' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Label Column (Segments)</Label>
                                <Select value={xAxis} onValueChange={setXAxis}>
                                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                    <SelectContent>{columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Value Column (Size)</Label>
                                <div className="flex gap-2">
                                    <Select value={yAxis} onValueChange={setYAxis}>
                                        <SelectTrigger className="flex-1"><SelectValue placeholder="Select Value" /></SelectTrigger>
                                        <SelectContent>{columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Select value={aggregates[yAxis] || ""} onValueChange={(val) => handleAggregateChange(yAxis, val)}>
                                        <SelectTrigger className="w-[100px]"><SelectValue placeholder="Agg" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="SUM">Sum</SelectItem>
                                            <SelectItem value="AVG">Avg</SelectItem>
                                            <SelectItem value="COUNT">Count</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pivot / Table */}
                    {(chartType === 'datatable' || chartType === 'pivot') && (
                        <div className="space-y-2">
                            <Label>Select Columns</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border p-4 max-h-60 overflow-y-auto rounded-md bg-white">
                                {columns.map(col => (
                                    <div key={col} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`col-${col}`}
                                            checked={selectedColumns.includes(col)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedColumns([...selectedColumns, col]);
                                                else setSelectedColumns(selectedColumns.filter(c => c !== col));
                                            }}
                                        />
                                        <Label htmlFor={`col-${col}`} className="cursor-pointer text-sm">{col}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
