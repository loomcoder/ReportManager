"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Report } from "@/types";

interface ReportWidgetProps {
    reportId: string;
    type: "chart" | "table";
}

export function ReportWidget({ reportId, type }: ReportWidgetProps) {
    const [report, setReport] = useState<Report | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get(`/reports/${reportId}`);
                setReport(response.data);

                // Simulate data fetching based on report content
                // In a real app, this would call /api/reports/:id/execute
                const mockData = generateMockData(response.data.name);
                setData(mockData);
            } catch (error) {
                console.error("Failed to fetch report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    const generateMockData = (name: string) => {
        // Generate different data based on report name keywords
        if (name.toLowerCase().includes("sales")) {
            return [
                { name: "Jan", value: 4000 },
                { name: "Feb", value: 3000 },
                { name: "Mar", value: 2000 },
                { name: "Apr", value: 2780 },
                { name: "May", value: 1890 },
                { name: "Jun", value: 2390 },
            ];
        } else if (name.toLowerCase().includes("user")) {
            return [
                { name: "Mon", value: 120 },
                { name: "Tue", value: 132 },
                { name: "Wed", value: 101 },
                { name: "Thu", value: 134 },
                { name: "Fri", value: 90 },
                { name: "Sat", value: 230 },
                { name: "Sun", value: 210 },
            ];
        } else {
            return [
                { name: "A", value: 10 },
                { name: "B", value: 20 },
                { name: "C", value: 30 },
                { name: "D", value: 40 },
                { name: "E", value: 50 },
            ];
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center">Loading...</div>;
    }

    if (!report) {
        return <div className="flex h-full items-center justify-center text-red-500">Failed to load report</div>;
    }

    return (
        <div className="h-full w-full">
            {type === "chart" ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="overflow-auto h-full">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Name</th>
                                <th className="text-right p-2">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="p-2">{row.name}</td>
                                    <td className="text-right p-2">{row.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
