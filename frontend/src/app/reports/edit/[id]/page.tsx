"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import ReportWizard from "@/components/reports/ReportWizard";

export default function EditReportPage() {
    const params = useParams();
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get(`/reports/${params.id}`);
                setReport(response.data);
            } catch (err) {
                console.error("Failed to fetch report:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchReport();
        }
    }, [params.id]);

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!report) return <div className="p-8">Report not found</div>;

    return <ReportWizard initialData={report} isEditing={true} />;
}
