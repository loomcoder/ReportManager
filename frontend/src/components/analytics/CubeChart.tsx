import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCubeQuery } from '@cubejs-client/react';
import { Loader2 } from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface CubeChartProps {
    title: string;
    query: any;
    chartType: 'bar' | 'line' | 'pie' | 'area';
    xAxisKey?: string;
    yAxisKey?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function CubeChart({ title, query, chartType, xAxisKey, yAxisKey }: CubeChartProps) {
    const { resultSet, isLoading, error } = useCubeQuery(query);

    const getData = () => {
        if (!resultSet) return [];
        return resultSet.chartPivot();
    };

    const renderChart = () => {
        const data = getData();

        if (data.length === 0) {
            return <div className="text-sm text-muted-foreground py-8 text-center">No data available</div>;
        }

        switch (chartType) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xAxisKey || 'x'} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey={yAxisKey || 'y'} fill="#0088FE" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xAxisKey || 'x'} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey={yAxisKey || 'y'} stroke="#0088FE" />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xAxisKey || 'x'} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey={yAxisKey || 'y'} fill="#0088FE" stroke="#0088FE" />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey={yAxisKey || 'value'}
                                nameKey={xAxisKey || 'category'}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="text-sm text-muted-foreground py-8 text-center flex flex-col items-center justify-center h-[300px]">
                        No data available
                    </div>
                ) : (
                    renderChart()
                )}
            </CardContent>
        </Card>
    );
}
