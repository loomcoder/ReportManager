"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Save, Play } from "lucide-react";
import { ReportDetailsSelection } from "./steps/ReportDetailsSelection";
import { ChartTypeSelection, ChartType } from "./steps/ChartTypeSelection";
import { ChartSubTypeSelection } from "./steps/ChartSubTypeSelection";
import { DataSourceSelection } from "./steps/DataSourceSelection";
import { ChartConfiguration } from "./steps/ChartConfiguration";
import { EChartsRenderer } from "./charts/EChartsRenderer";
import { DataTableRenderer } from "./charts/DataTableRenderer";
import { logger } from "@/lib/logger";

export default function NewReportWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Wizard State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [chartType, setChartType] = useState<ChartType | "">("");
    const [subType, setSubType] = useState("");
    const [sourceId, setSourceId] = useState("");
    const [config, setConfig] = useState<any>({});

    // Preview State
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    const handleNext = () => {
        setStep(prev => prev + 1);
        setShowPreview(false);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
            setShowPreview(false);
        } else {
            router.back();
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return !!name;
            case 2: return !!chartType;
            case 3: return !!subType;
            case 4: return !!sourceId;
            case 5: return true;
            default: return false;
        }
    };

    const handlePreview = async () => {
        if (!sourceId || !config) return;
        setIsLoading(true);
        try {
            const payload = {
                sourceId,
                config: {
                    type: chartType,
                    ...config
                }
            };

            const response = await api.post("/reports/preview", payload);
            setPreviewData(response.data.data.rows || []);
            setShowPreview(true);
        } catch (err) {
            logger.error("Preview failed:", err);
            alert("Failed to load preview. Please check your configuration.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                name,
                description,
                sourceId,
                config: {
                    type: chartType,
                    subType,
                    ...config
                }
            };
            await api.post("/reports", payload);
            router.push("/reports");
        } catch (err) {
            logger.error("Failed to save report:", err);
            alert("Failed to save report");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Create New Report</h1>
                <p className="text-muted-foreground">Follow the steps to configure your advanced report.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center mb-8 space-x-2 sm:space-x-4 overflow-x-auto">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex items-center whitespace-nowrap">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm ${step >= s ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"}`}>
                            {s}
                        </div>
                        <span className={`ml-2 text-sm font-medium hidden md:inline ${step >= s ? "text-primary" : "text-muted-foreground"}`}>
                            {s === 1 ? "Details" : s === 2 ? "Type" : s === 3 ? "Sub-Type" : s === 4 ? "Source" : "Config"}
                        </span>
                        {s < 5 && <div className="w-4 sm:w-8 h-0.5 bg-border mx-1 sm:mx-2" />}
                    </div>
                ))}
            </div>

            <Card className="min-h-[500px] flex flex-col">
                <CardContent className="flex-1 pt-6">
                    {step === 1 && (
                        <ReportDetailsSelection
                            name={name}
                            description={description}
                            onNameChange={setName}
                            onDescriptionChange={setDescription}
                        />
                    )}
                    {step === 2 && (
                        <ChartTypeSelection
                            selectedType={chartType}
                            onSelect={(type) => {
                                setChartType(type);
                                setSubType("");
                            }}
                        />
                    )}
                    {step === 3 && chartType && (
                        <ChartSubTypeSelection
                            parentType={chartType}
                            selectedSubType={subType}
                            onSelect={setSubType}
                        />
                    )}
                    {step === 4 && (
                        <DataSourceSelection
                            selectedSourceId={sourceId}
                            onSelect={setSourceId}
                        />
                    )}
                    {step === 5 && chartType && (
                        <div className="space-y-6">
                            <ChartConfiguration
                                sourceId={sourceId}
                                chartType={chartType}
                                subType={subType}
                                onConfigChange={setConfig}
                            />

                            <div className="flex justify-center border-t pt-6">
                                <Button onClick={handlePreview} disabled={isLoading} variant="secondary">
                                    <Play className="mr-2 h-4 w-4" /> Preview
                                </Button>
                            </div>

                            {showPreview && (
                                <div className="border rounded-lg p-4 bg-muted/10">
                                    <h3 className="font-semibold mb-4">Preview</h3>
                                    {(chartType === 'datatable' || chartType === 'pivot') ? (
                                        <DataTableRenderer
                                            data={previewData}
                                            config={config}
                                            type={chartType}
                                        />
                                    ) : (
                                        <EChartsRenderer
                                            chartType={chartType}
                                            subType={subType}
                                            data={previewData}
                                            config={config}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
                    <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> {step === 1 ? "Cancel" : "Back"}
                    </Button>

                    {step < 5 ? (
                        <Button onClick={handleNext} disabled={!isStepValid()}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSave} disabled={isLoading}>
                            <Save className="mr-2 h-4 w-4" /> Save Report
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
