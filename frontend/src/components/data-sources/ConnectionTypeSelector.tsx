"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Code, Table, Zap } from "lucide-react";

interface ConnectionTypeSelectorProps {
    value: 'table' | 'query' | 'procedure';
    onChange: (type: 'table' | 'query' | 'procedure') => void;
}

export function ConnectionTypeSelector({ value, onChange }: ConnectionTypeSelectorProps) {
    const connectionTypes = [
        {
            value: 'table' as const,
            label: 'Table Connection',
            description: 'Connect directly to a database table or view',
            icon: Table,
        },
        {
            value: 'query' as const,
            label: 'SQL Query',
            description: 'Use a custom SQL query to fetch data',
            icon: Code,
        },
        {
            value: 'procedure' as const,
            label: 'Stored Procedure',
            description: 'Execute a stored procedure',
            icon: Zap,
        },
    ];

    return (
        <div className="space-y-3">
            <Label>Connection Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {connectionTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = value === type.value;

                    return (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => onChange(type.value)}
                            className={`relative flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left ${isSelected
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-gray-500'}`} />
                                <span className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                                    {type.label}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">
                                {type.description}
                            </p>
                            {isSelected && (
                                <div className="absolute top-2 right-2">
                                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
