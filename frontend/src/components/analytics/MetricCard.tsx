import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCubeQuery } from '@cubejs-client/react';
import { Loader2 } from 'lucide-react';

interface MetricCardProps {
    title: string;
    query: any;
    icon?: React.ReactNode;
    formatter?: (value: any) => string;
}

export function MetricCard({ title, query, icon, formatter }: MetricCardProps) {
    const { resultSet, isLoading, error } = useCubeQuery(query);

    const getValue = () => {
        if (!resultSet) return '-';
        const data = resultSet.tablePivot();
        if (data.length === 0) return '0';

        const value = Object.values(data[0])[0];
        return formatter ? formatter(value) : value;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="text-sm text-destructive" style={{ wordBreak: "break-all" }}>Error: {error?.message || error?.toString() || 'Unknown'}</div>
                ) : (
                    <div className="text-2xl font-bold">{getValue()}</div>
                )}
            </CardContent>
        </Card>
    );
}
