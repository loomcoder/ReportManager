"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseConfig } from "@/types";
import { Database, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface DatabaseConnectorProps {
    type: 'postgres' | 'mysql' | 'sqlserver' | 'mongodb' | 'oracle';
    connectionType: 'table' | 'query' | 'procedure';
    config: Partial<DatabaseConfig>;
    onChange: (config: Partial<DatabaseConfig>) => void;
    onTest?: (config: Partial<DatabaseConfig>) => Promise<{ status: string; message: string }>;
}

export function DatabaseConnector({ type, connectionType, config, onChange, onTest }: DatabaseConnectorProps) {
    const [localConfig, setLocalConfig] = useState<Partial<DatabaseConfig>>(config);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ status: string; message: string } | null>(null);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleChange = (field: keyof DatabaseConfig, value: any) => {
        const updated = { ...localConfig, [field]: value };
        setLocalConfig(updated);
        onChange(updated);
    };

    const handleTestConnection = async () => {
        if (!onTest) return;

        setTesting(true);
        setTestResult(null);

        try {
            const result = await onTest(localConfig);
            setTestResult(result);
        } catch (error: any) {
            setTestResult({ status: 'error', message: error.message || 'Connection failed' });
        } finally {
            setTesting(false);
        }
    };

    const getDefaultPort = () => {
        switch (type) {
            case 'postgres': return 5432;
            case 'mysql': return 3306;
            case 'sqlserver': return 1433;
            case 'mongodb': return 27017;
            case 'oracle': return 1521;
            default: return 5432;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {type.toUpperCase()} Connection
                </CardTitle>
                <CardDescription>
                    Configure your {type} database connection settings
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="host">Host</Label>
                        <Input
                            id="host"
                            placeholder="localhost"
                            value={localConfig.host || ''}
                            onChange={(e) => handleChange('host', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input
                            id="port"
                            type="number"
                            placeholder={String(getDefaultPort())}
                            value={localConfig.port || ''}
                            onChange={(e) => handleChange('port', parseInt(e.target.value) || getDefaultPort())}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="database">Database Name</Label>
                    <Input
                        id="database"
                        placeholder="my_database"
                        value={localConfig.database || ''}
                        onChange={(e) => handleChange('database', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            placeholder="admin"
                            value={localConfig.username || ''}
                            onChange={(e) => handleChange('username', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={localConfig.password || ''}
                            onChange={(e) => handleChange('password', e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="ssl"
                        checked={localConfig.ssl || false}
                        onChange={(e) => handleChange('ssl', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="ssl" className="cursor-pointer">Enable SSL/TLS</Label>
                </div>

                {connectionType === 'query' && (
                    <div className="space-y-2">
                        <Label htmlFor="query">SQL Query</Label>
                        <textarea
                            id="query"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="SELECT * FROM table_name WHERE ..."
                            value={localConfig.query || ''}
                            onChange={(e) => handleChange('query', e.target.value)}
                        />
                    </div>
                )}

                {connectionType === 'table' && (
                    <div className="space-y-2">
                        <Label htmlFor="tableName">Table Name</Label>
                        <Input
                            id="tableName"
                            placeholder="users"
                            value={localConfig.tableName || ''}
                            onChange={(e) => handleChange('tableName', e.target.value)}
                        />
                    </div>
                )}

                {connectionType === 'procedure' && (
                    <div className="space-y-2">
                        <Label htmlFor="procedureName">Stored Procedure Name</Label>
                        <Input
                            id="procedureName"
                            placeholder="sp_get_data"
                            value={localConfig.procedureName || ''}
                            onChange={(e) => handleChange('procedureName', e.target.value)}
                        />
                    </div>
                )}

                {onTest && (
                    <div className="space-y-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleTestConnection}
                            disabled={testing || !localConfig.host || !localConfig.database}
                            className="w-full"
                        >
                            {testing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing Connection...
                                </>
                            ) : (
                                <>
                                    <Database className="mr-2 h-4 w-4" />
                                    Test Connection
                                </>
                            )}
                        </Button>

                        {testResult && (
                            <div className={`flex items-center gap-2 p-3 rounded-md text-sm ${testResult.status === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {testResult.status === 'success' ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <XCircle className="h-4 w-4" />
                                )}
                                <span>{testResult.message}</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
