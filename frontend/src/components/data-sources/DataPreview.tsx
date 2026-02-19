"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { DatabaseConfig, FileMetadata } from "@/types";

interface DataPreviewProps {
    type: string;
    connectionType: string;
    config: any;
    file: File | null;
    fileMetadata: Partial<FileMetadata>;
}

export function DataPreview({ type, connectionType, config, file, fileMetadata }: DataPreviewProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{ columns: string[], rows: any[] } | null>(null);

    const fetchPreview = async () => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("type", type);
            formData.append("connectionType", connectionType);

            if (file) {
                formData.append("file", file);
                if (fileMetadata.sheetName) formData.append("sheetName", fileMetadata.sheetName);
                if (fileMetadata.delimiter) formData.append("delimiter", fileMetadata.delimiter);
                if (fileMetadata.hasHeader !== undefined) formData.append("hasHeader", String(fileMetadata.hasHeader));
            } else if ((type === 'excel' || type === 'csv') && fileMetadata.filePath) {
                formData.append("filePath", fileMetadata.filePath);
                if (fileMetadata.sheetName) formData.append("sheetName", fileMetadata.sheetName);
                if (fileMetadata.delimiter) formData.append("delimiter", fileMetadata.delimiter);
                if (fileMetadata.hasHeader !== undefined) formData.append("hasHeader", String(fileMetadata.hasHeader));
            } else {
                formData.append("config", JSON.stringify(config));
                if (connectionType === 'query' && config.query) formData.append("query", config.query);
                if (connectionType === 'table' && config.tableName) formData.append("tableName", config.tableName);
                if (connectionType === 'procedure' && config.procedureName) formData.append("procedureName", config.procedureName);
            }

            const response = await api.post("/data-sources/preview", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data.status === "success") {
                setData(response.data.data);
            } else {
                setError(response.data.message || "Failed to load preview");
            }
        } catch (err: any) {
            console.error("Preview error:", err);
            setError(err.response?.data?.message || err.message || "Failed to load preview");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreview();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading data preview...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 space-y-4 text-red-500">
                <AlertCircle className="h-8 w-8" />
                <p>{error}</p>
                <Button variant="outline" onClick={fetchPreview}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
            </div>
        );
    }

    if (!data || !data.columns || data.columns.length === 0) {
        return (
            <div className="text-center p-10 text-muted-foreground">
                No data available for preview.
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Data Preview</CardTitle>
                    <CardDescription>Showing first {data.rows.length} rows</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchPreview}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {data.columns.map((col, idx) => (
                                    <TableHead key={idx} className="whitespace-nowrap">{col}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.rows.map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    {data.columns.map((col, colIdx) => (
                                        <TableCell key={colIdx} className="whitespace-nowrap">
                                            {row[col]?.toString() || ''}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
