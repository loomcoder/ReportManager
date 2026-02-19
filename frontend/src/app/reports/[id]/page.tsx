"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Download } from "lucide-react";
import CubeReportRenderer from "@/components/reports/CubeReportRenderer";
import { CubeProvider } from "@cubejs-client/react";
import cubejsApi from "@/lib/cube";

export default function ReportViewPage() {
    const params = useParams();
    const router = useRouter();
    const [report, setReport] = useState<any>(null);

    useEffect(() => {
        if (!params.id) return;

        api.get(`/reports/${params.id}`)
            .then(res => {
                setReport(res.data);
            })
            .catch(err => console.error(err));
    }, [params.id]);

    const handleExportReport = () => {
        if (!report) return;

        const reportData = [report];
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `report-${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!report) return <div className="p-8">Loading report...</div>;

    // Map report config to Cube query
    // If it's a legacy report, we'll try to adapt it to Cube if possible, 
    // but the task assumes all reports are now Cube-ready.
    // If report.config.query is already a Cube query, use it.
    // Otherwise, construct one from xAxis/yAxis/aggregates.
    
    let cubeQuery = report.config.query;
    
    // Fallback/Legacy mapping if query isn't already a Cube query object
    if (!cubeQuery || typeof cubeQuery === 'string') {
        const sourceName = `Source${report.sourceId}`; // Cube schema uses SourceID as cube name
        const measure = report.config.yAxis ? `${sourceName}.${report.config.yAxis}` : null;
        const dimension = report.config.xAxis ? `${sourceName}.${report.config.xAxis}` : null;
        
        cubeQuery = {
            measures: measure ? [measure] : [],
            dimensions: dimension ? [dimension] : [],
            timeDimensions: []
        };
    }

    return (
        <CubeProvider cubejsApi={cubejsApi}>
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
                        <CubeReportRenderer 
                            query={cubeQuery} 
                            chartType={report.config.type === 'datatable' ? 'table' : report.config.type} 
                        />
                    </CardContent>
                </Card>
            </div>
        </CubeProvider>
    );
}
