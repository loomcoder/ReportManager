import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DataTableRendererProps {
    data: any[];
    config: any;
    type: 'datatable' | 'pivot';
}

export const DataTableRenderer: React.FC<DataTableRendererProps> = ({ data, config, type }) => {
    if (!data || data.length === 0) {
        return <div className="text-center p-4 text-muted-foreground">No data available</div>;
    }

    const columns = Object.keys(data[0]);

    // TODO: Implement actual Pivot logic if type === 'pivot'
    // For now, render raw data for both

    return (
        <div className="border rounded-md overflow-hidden">
            <div className="max-h-[400px] overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col}>{col}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, i) => (
                            <TableRow key={i}>
                                {columns.map((col) => (
                                    <TableCell key={col}>{row[col]}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="p-2 bg-muted text-xs text-right">
                {data.length} rows
            </div>
        </div>
    );
};
