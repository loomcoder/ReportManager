"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DataSource, DatabaseConfig, FileMetadata } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Database, RefreshCw, Trash2, Edit, ChevronRight, ChevronLeft, FileSpreadsheet, FileText, Server, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { DatabaseConnector } from "@/components/data-sources/DatabaseConnector";
import { FileUploader } from "@/components/data-sources/FileUploader";
import { ConnectionTypeSelector } from "@/components/data-sources/ConnectionTypeSelector";
import { DataPreview } from "@/components/data-sources/DataPreview";

type DataSourceType = 'postgres' | 'mysql' | 'sqlserver' | 'mongodb' | 'oracle' | 'excel' | 'csv' | 'api';
type ConnectionType = 'table' | 'query' | 'procedure' | 'file';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { logger } from "@/lib/logger";

export default function DataSourcesPage() {
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewingDataSource, setViewingDataSource] = useState<DataSource | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    // Form state
    const [name, setName] = useState("");
    const [type, setType] = useState<DataSourceType>("postgres");
    const [connectionType, setConnectionType] = useState<ConnectionType>("table");
    const [databaseConfig, setDatabaseConfig] = useState<Partial<DatabaseConfig>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileMetadata, setFileMetadata] = useState<Partial<FileMetadata>>({});

    const fetchDataSources = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/data-sources");
            setDataSources(response.data);
            setError("");
        } catch (err: any) {
            logger.error("Failed to fetch data sources:", err);
            setError("Failed to load data sources. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDataSources();
    }, []);

    const resetForm = () => {
        setName("");
        setType("postgres");
        setConnectionType("table");
        setDatabaseConfig({});
        setSelectedFile(null);
        setFileMetadata({});
        setCurrentStep(1);
        setEditingId(null);
        setIsCreating(false);
    };

    const handleCreate = async () => {
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("type", type);
            formData.append("connectionType", connectionType);

            if (type === 'excel' || type === 'csv') {
                if (selectedFile) {
                    formData.append("file", selectedFile);
                    if (fileMetadata.sheetName) {
                        formData.append("sheetName", fileMetadata.sheetName);
                    }
                    if (fileMetadata.delimiter) {
                        formData.append("delimiter", fileMetadata.delimiter);
                    }
                    if (fileMetadata.hasHeader !== undefined) {
                        formData.append("hasHeader", String(fileMetadata.hasHeader));
                    }
                } else if (editingId && fileMetadata.filePath) {
                    // Keep existing file
                    if (fileMetadata.sheetName) {
                        formData.append("sheetName", fileMetadata.sheetName);
                    }
                    if (fileMetadata.delimiter) {
                        formData.append("delimiter", fileMetadata.delimiter);
                    }
                    if (fileMetadata.hasHeader !== undefined) {
                        formData.append("hasHeader", String(fileMetadata.hasHeader));
                    }
                } else {
                    alert("Please select a file");
                    return;
                }
            } else {
                formData.append("config", JSON.stringify(databaseConfig));
                if (connectionType === 'query' && databaseConfig.query) {
                    formData.append("query", databaseConfig.query);
                }
                if (connectionType === 'table' && databaseConfig.tableName) {
                    formData.append("tableName", databaseConfig.tableName);
                }
                if (connectionType === 'procedure' && databaseConfig.procedureName) {
                    formData.append("procedureName", databaseConfig.procedureName);
                }
            }

            if (editingId) {
                await api.put(`/data-sources/${editingId}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                await api.post("/data-sources", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            resetForm();
            fetchDataSources();
        } catch (err: any) {
            logger.error("Failed to save data source:", err);
            alert("Failed to save data source: " + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (ds: DataSource) => {
        setName(ds.name);
        setType(ds.type);
        setConnectionType(ds.connectionType || 'table');

        if (ds.config) {
            setDatabaseConfig(ds.config as DatabaseConfig);
        }

        if (ds.fileMetadata) {
            setFileMetadata(ds.fileMetadata);
        }

        setEditingId(ds.id);
        setIsCreating(true);
        setCurrentStep(1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this data source?")) return;
        try {
            await api.delete(`/data-sources/${id}`);
            fetchDataSources();
        } catch (err: any) {
            logger.error("Failed to delete data source:", err);
            alert("Failed to delete data source");
        }
    };

    const handleTestConnection = async (config: Partial<DatabaseConfig>) => {
        try {
            const response = await api.post("/data-sources/test", {
                type,
                config
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Connection failed");
        }
    };

    const canProceedToNextStep = () => {
        if (currentStep === 1) {
            return name.trim() !== '';
        }
        if (currentStep === 2) {
            if (type === 'excel' || type === 'csv') {
                return selectedFile !== null || (!!fileMetadata.fileName);
            } else {
                return databaseConfig.host && databaseConfig.database;
            }
        }
        return true;
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'connected':
            case 'active':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Database className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'excel':
                return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
            case 'csv':
                return <FileText className="h-4 w-4 text-blue-600" />;
            default:
                return <Server className="h-4 w-4 text-purple-600" />;
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Data Sources</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={fetchDataSources}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => {
                        resetForm();
                        setIsCreating(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Data Source
                    </Button>
                </div>
            </div>

            {isCreating && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingId ? "Edit Data Source" : "Add New Data Source"}</CardTitle>
                        <CardDescription>
                            Step {currentStep} of 4: {
                                currentStep === 1 ? "Basic Information" :
                                    currentStep === 2 ? "Connection Configuration" :
                                        currentStep === 3 ? "Data Preview" :
                                            "Review & Save"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Data Source Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="My Database"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Data Source Type</Label>
                                    <select
                                        id="type"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        value={type}
                                        onChange={(e) => {
                                            const newType = e.target.value as DataSourceType;
                                            setType(newType);
                                            if (newType === 'excel' || newType === 'csv') {
                                                setConnectionType('file');
                                            } else {
                                                setConnectionType('table');
                                            }
                                        }}
                                    >
                                        <optgroup label="Databases">
                                            <option value="postgres">PostgreSQL</option>
                                            <option value="mysql">MySQL</option>
                                            <option value="sqlserver">SQL Server</option>
                                            <option value="mongodb">MongoDB</option>
                                            <option value="oracle">Oracle</option>
                                        </optgroup>
                                        <optgroup label="Files">
                                            <option value="excel">Excel</option>
                                            <option value="csv">CSV</option>
                                        </optgroup>
                                        <optgroup label="APIs">
                                            <option value="api">REST API</option>
                                        </optgroup>
                                    </select>
                                </div>

                                {!['excel', 'csv'].includes(type) && (
                                    <ConnectionTypeSelector
                                        value={connectionType as 'table' | 'query' | 'procedure'}
                                        onChange={setConnectionType}
                                    />
                                )}
                            </div>
                        )}

                        {/* Step 2: Connection Configuration */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                {type === 'excel' || type === 'csv' ? (
                                    <FileUploader
                                        type={type}
                                        fileMetadata={fileMetadata}
                                        onFileSelect={(file, metadata) => {
                                            setSelectedFile(file);
                                            setFileMetadata(metadata);
                                        }}
                                        onFileRemove={() => {
                                            setSelectedFile(null);
                                            setFileMetadata({});
                                        }}
                                    />
                                ) : (
                                    <DatabaseConnector
                                        type={type as any}
                                        connectionType={connectionType as any}
                                        config={databaseConfig}
                                        onChange={setDatabaseConfig}
                                        onTest={handleTestConnection}
                                    />
                                )}
                            </div>
                        )}

                        {/* Step 3: Data Preview */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <DataPreview
                                    type={type}
                                    connectionType={connectionType}
                                    config={databaseConfig}
                                    file={selectedFile}
                                    fileMetadata={fileMetadata}
                                />
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <Card className="bg-gray-50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Review Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Name:</span>
                                            <span className="text-sm">{name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Type:</span>
                                            <span className="text-sm capitalize">{type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Connection Type:</span>
                                            <span className="text-sm capitalize">{connectionType}</span>
                                        </div>
                                        {type === 'excel' || type === 'csv' ? (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium">File:</span>
                                                    <span className="text-sm">{selectedFile?.name || fileMetadata.fileName}</span>
                                                </div>
                                                {type === 'excel' && fileMetadata.sheetName && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium">Sheet:</span>
                                                        <span className="text-sm">{fileMetadata.sheetName}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium">Host:</span>
                                                    <span className="text-sm">{databaseConfig.host}:{databaseConfig.port}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium">Database:</span>
                                                    <span className="text-sm">{databaseConfig.database}</span>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (currentStep === 1) {
                                        resetForm();
                                    } else {
                                        setCurrentStep(currentStep - 1);
                                    }
                                }}
                            >
                                {currentStep === 1 ? (
                                    "Cancel"
                                ) : (
                                    <>
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Previous
                                    </>
                                )}
                            </Button>

                            {currentStep < 4 ? (
                                <Button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    disabled={!canProceedToNextStep()}
                                >
                                    Next
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleCreate}
                                >
                                    {editingId ? "Update" : "Create"} Data Source
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Connected Sources</CardTitle>
                    <CardDescription>Manage your data connections.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : dataSources.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No data sources found. Add one to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Connection</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dataSources.map((ds) => (
                                    <TableRow key={ds.id}>
                                        <TableCell className="font-medium">
                                            <div
                                                className="flex items-center gap-2 cursor-pointer hover:underline text-primary"
                                                onClick={() => setViewingDataSource(ds)}
                                            >
                                                {getTypeIcon(ds.type)}
                                                {ds.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize">{ds.type}</TableCell>
                                        <TableCell className="capitalize text-sm text-gray-600">
                                            {ds.connectionType || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(ds.status)}
                                                <span className="text-sm capitalize">{ds.status || 'Unknown'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(ds.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(ds)}>
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(ds.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!viewingDataSource} onOpenChange={(open) => !open && setViewingDataSource(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Data Preview: {viewingDataSource?.name}</DialogTitle>
                        <DialogDescription>
                            Previewing data for {viewingDataSource?.type} connection
                        </DialogDescription>
                    </DialogHeader>
                    {viewingDataSource && (
                        <DataPreview
                            type={viewingDataSource.type}
                            connectionType={viewingDataSource.connectionType || 'table'}
                            config={viewingDataSource.config || {}}
                            file={null}
                            fileMetadata={viewingDataSource.fileMetadata || {}}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
