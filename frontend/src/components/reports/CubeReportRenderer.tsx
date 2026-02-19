"use client";

import { useCubeQuery } from "@cubejs-client/react";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CubeReportRendererProps {
    query: any; // Cube.js query object
    chartType: 'bar' | 'line' | 'pie' | 'table';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function CubeReportRenderer({ query, chartType }: CubeReportRendererProps) {
    const { resultSet, isLoading, error } = useCubeQuery(query);

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error.message}</div>;
    }

    if (!resultSet) {
        return null;
    }

    const data = resultSet.chartPivot();

    if (chartType === 'table') {
        const columns = resultSet.tableColumns();
        return (
            <div className="mt-8 border rounded-lg overflow-hidden">
                <div className="bg-muted p-2 text-sm font-medium">Data Table</div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map(col => (
                                    <TableHead key={col.key}>{col.title}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row: any, i: number) => (
                                <TableRow key={i}>
                                    {columns.map(col => (
                                        <TableCell key={col.key}>{row[col.key] !== undefined ? row[col.key].toString() : ''}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    const series = resultSet.seriesNames();

    return (
        <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="x" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {series.map((s: any, index: number) => (
                            <Bar
                                key={s.key}
                                dataKey={s.key}
                                name={s.title}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </BarChart>
                ) : chartType === 'line' ? (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="x" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {series.map((s: any, index: number) => (
                            <Line
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.title}
                                stroke={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </LineChart>
                ) : chartType === 'pie' ? (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey={series[0]?.key}
                            nameKey="x"
                        >
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                ) : (
                    <div>Unsupported chart type</div>
                )}
            </ResponsiveContainer>
        </div>
    );
}
