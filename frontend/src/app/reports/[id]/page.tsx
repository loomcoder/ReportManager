"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Pencil, Download } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CubeReportRenderer from "@/components/reports/CubeReportRenderer";
import { CubeProvider } from "@cubejs-client/react";
import cubejsApi from "@/lib/cube";

export default function ReportViewPage() {
    const params = useParams();
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [data, setData] = useState<{ columns: string[], rows: any[] } | null>(null);
    // Removed isLoading and error states as per new useEffect logic

    useEffect(() => {
        if (!params.id) return;

        api.get(`/reports/${params.id}`)
            .then(res => {
                const reportData = res.data;
                setReport(reportData);
                if (reportData.config.sourceType !== 'cube') {
                    // Fetch data for SQL reports
                    api.post(`/reports/${params.id}/run`)
                        .then(runRes => setData(runRes.data.data))
                        .catch(err => console.error(err));
                }
            })
            .catch(err => console.error(err));
    }, [params.id]);

    const handleExportReport = () => {
        if (!report) return;

        // Create JSON file with just this report
        const reportData = [report]; // Wrap in array for consistency with bulk export
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });

        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `report-${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Removed isLoading and error conditional renders as per new useEffect logic

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (!report) return <div className="p-8">Report not found</div>;
    if (report.config.sourceType !== 'cube' && !data) return <div className="p-8">Loading report data...</div>;

    const renderChart = () => {
        const { type, xAxis, yAxis: yAxisKey, sourceType, query } = report.config;

        if (sourceType === 'cube') {
            return <CubeReportRenderer query={query} chartType={type as any} />;
        }

        if (type === 'table') return null;

        if (!xAxis || !yAxisKey) {
            return <div className="text-muted-foreground p-4">Chart configuration missing (X/Y Axis)</div>;
        }

        return (
            <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    {type === 'bar' ? (
                        <BarChart data={data?.rows || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xAxis} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey={yAxisKey} fill="#8884d8" />
                        </BarChart>
                    ) : type === 'line' ? (
                        <LineChart data={data?.rows || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xAxis} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey={yAxisKey} stroke="#8884d8" />
                        </LineChart>
                    ) : type === 'pie' ? (
                        <PieChart>
                            <Pie
                                data={data?.rows || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey={yAxisKey}
                                nameKey={xAxis}
                            >
                                {(data?.rows || []).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    ) : (
                        <div>Unsupported chart type</div>
                    )}
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{report.name}</h2>
                        <p className="text-muted-foreground">{report.description}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => router.push(`/reports/edit/${report.id}`)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Configuration
                    </Button>
                    <Button variant="outline" onClick={handleExportReport}>
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Report Data</CardTitle>
                    <CardDescription>
                        Source: {report.sourceId} | Type: {report.config.type}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderChart()}

                    {data && (
                        <div className="mt-8 border rounded-lg overflow-hidden">
                            <div className="bg-muted p-2 text-sm font-medium">Data Table</div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {data.columns.map((col: string) => (
                                                <TableHead key={col}>{col}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.rows.map((row: any, i: number) => (
                                            <TableRow key={i}>
                                                {data.columns.map((col: string) => (
                                                    <TableCell key={col}>{row[col]}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
