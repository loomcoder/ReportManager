import React, { useEffect, useState } from 'react';
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Database, FileSpreadsheet } from "lucide-react";

interface DataSource {
    id: string;
    name: string;
    type: string;
    connectionType: string;
}

interface DataSourceSelectionProps {
    selectedSourceId: string;
    onSelect: (sourceId: string) => void;
}

export const DataSourceSelection: React.FC<DataSourceSelectionProps> = ({ selectedSourceId, onSelect }) => {
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDataSources = async () => {
            try {
                const response = await api.get("/data-sources");
                setDataSources(response.data);
            } catch (err) {
                console.error("Failed to fetch data sources:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDataSources();
    }, []);

    if (isLoading) {
        return <div className="text-center py-20 text-muted-foreground">Loading data sources...</div>;
    }

    if (dataSources.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                No data sources available. Please create a data source first.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Select Data Source</h2>
                <p className="text-muted-foreground">Choose where your data comes from.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataSources.map((ds) => (
                    <Card
                        key={ds.id}
                        className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${selectedSourceId === ds.id ? "border-primary bg-primary/5 ring-1 ring-primary" : ""}`}
                        onClick={() => onSelect(ds.id)}
                    >
                        <CardContent className="flex items-center p-4 space-x-4">
                            <div className={`p-3 rounded-full ${selectedSourceId === ds.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                {ds.type === 'excel' || ds.type === 'csv' ? <FileSpreadsheet className="h-6 w-6" /> : <Database className="h-6 w-6" />}
                            </div>
                            <div>
                                <div className="font-medium">{ds.name}</div>
                                <div className="text-sm text-muted-foreground capitalize">{ds.type}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
