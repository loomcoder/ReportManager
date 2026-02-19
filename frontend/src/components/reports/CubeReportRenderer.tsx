"use client";

import { useCubeQuery } from "@cubejs-client/react";
import cubejsApi from "@/lib/cube";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CubeReportRendererProps {
    query: any; // Cube.js query object
    chartType: 'bar' | 'line' | 'table';
}

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
        return (
            <div className="overflow-auto max-h-[400px]">
                <table className="w-full border-collapse border border-slate-200">
                    <thead>
                        <tr>
                            {Object.keys(data[0] || {}).map(key => (
                                <th key={key} className="border border-slate-200 p-2 text-left">{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row: any, i: number) => (
                            <tr key={i}>
                                {Object.values(row).map((val: any, j: number) => (
                                    <td key={j} className="border border-slate-200 p-2">{val ? val.toString() : ''}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                                fill={`hsl(${index * 60}, 70%, 50%)`}
                            />
                        ))}
                    </BarChart>
                ) : (
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
                                stroke={`hsl(${index * 60}, 70%, 50%)`}
                            />
                        ))}
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
