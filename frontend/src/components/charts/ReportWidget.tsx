"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Report } from "@/types";
import CubeReportRenderer from "@/components/reports/CubeReportRenderer";
import { CubeProvider } from "@cubejs-client/react";
import cubejsApi from "@/lib/cube";

interface ReportWidgetProps {
    reportId: string;
    type: "chart" | "table";
}

export function ReportWidget({ reportId, type }: ReportWidgetProps) {
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get(`/reports/${reportId}`);
                setReport(response.data);
            } catch (error) {
                console.error("Failed to fetch report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    if (loading) {
        return <div className="flex h-full items-center justify-center">Loading...</div>;
    }

    if (!report) {
        return <div className="flex h-full items-center justify-center text-red-500">Failed to load report</div>;
    }

    // Map report config to Cube query
    let cubeQuery = (report.config as any).query;
    
    // Fallback/Legacy mapping
    if (!cubeQuery || typeof cubeQuery === 'string') {
        const sourceName = `Source${report.sourceId}`;
        const measure = (report.config as any).yAxis ? `${sourceName}.${(report.config as any).yAxis}` : null;
        const dimension = (report.config as any).xAxis ? `${sourceName}.${(report.config as any).xAxis}` : null;
        
        cubeQuery = {
            measures: measure ? [measure] : [],
            dimensions: dimension ? [dimension] : [],
            timeDimensions: []
        };
    }

    return (
        <CubeProvider cubejsApi={cubejsApi}>
            <div className="h-full w-full">
                <CubeReportRenderer 
                    query={cubeQuery} 
                    chartType={type === 'table' ? 'table' : (report.config as any).type} 
                />
            </div>
        </CubeProvider>
    );
}
