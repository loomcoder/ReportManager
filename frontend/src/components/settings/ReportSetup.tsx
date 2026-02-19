"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type FieldType = "string" | "number" | "date";

interface ReportField {
    name: string;
    type: FieldType;
}

interface ReportConfig {
    id: string;
    name: string;
    chartType: string;
    description: string;
    fields: ReportField[];
}

export function ReportSetup() {
    // Mock initial state - in a real app this would come from an API
    const [reports, setReports] = useState<ReportConfig[]>([
        {
            id: "1",
            name: "Monthly Sales",
            chartType: "bar",
            description: "Monthly sales aggregate by region",
            fields: [
                { name: "month", type: "date" },
                { name: "sales", type: "number" },
            ],
        },
    ]);

    const [isCreating, setIsCreating] = useState(false);
    const [newReport, setNewReport] = useState<Partial<ReportConfig>>({
        name: "",
        chartType: "line",
        description: "",
        fields: [],
    });

    const [newField, setNewField] = useState<ReportField>({
        name: "",
        type: "string",
    });

    const handleAddField = () => {
        if (!newField.name) return;
        setNewReport({
            ...newReport,
            fields: [...(newReport.fields || []), newField],
        });
        setNewField({ name: "", type: "string" });
    };

    const handleRemoveField = (index: number) => {
        const updatedFields = [...(newReport.fields || [])];
        updatedFields.splice(index, 1);
        setNewReport({ ...newReport, fields: updatedFields });
    };

    const handleSaveReport = () => {
        if (!newReport.name || !newReport.chartType) return;

        const report: ReportConfig = {
            id: Math.random().toString(36).substr(2, 9),
            name: newReport.name,
            chartType: newReport.chartType,
            description: newReport.description || "",
            fields: newReport.fields || [],
        };

        setReports([...reports, report]);
        setIsCreating(false);
        setNewReport({ name: "", chartType: "line", description: "", fields: [] });
    };

    const handleDeleteReport = (id: string) => {
        setReports(reports.filter((r) => r.id !== id));
    };

    if (isCreating) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Create New Report Type</CardTitle>
                    <CardDescription>
                        Define the structure and visualization for a new report.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Report Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. User Growth"
                                value={newReport.name}
                                onChange={(e) =>
                                    setNewReport({ ...newReport, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Brief description of this report"
                                value={newReport.description}
                                onChange={(e) =>
                                    setNewReport({ ...newReport, description: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="chartType">Chart Type</Label>
                            <Select
                                value={newReport.chartType}
                                onValueChange={(value) =>
                                    setNewReport({ ...newReport, chartType: value })
                                }
                            >
                                <SelectTrigger id="chartType">
                                    <SelectValue placeholder="Select chart type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="line">Line Chart</SelectItem>
                                    <SelectItem value="bar">Bar Chart</SelectItem>
                                    <SelectItem value="area">Area Chart</SelectItem>
                                    <SelectItem value="pie">Pie Chart</SelectItem>
                                    <SelectItem value="scatter">Scatter Plot</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Data Requirements</h4>
                        <div className="flex items-end gap-2">
                            <div className="grid gap-2 flex-1">
                                <Label htmlFor="fieldName">Field Name</Label>
                                <Input
                                    id="fieldName"
                                    placeholder="e.g. timestamp"
                                    value={newField.name}
                                    onChange={(e) =>
                                        setNewField({ ...newField, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid gap-2 w-[150px]">
                                <Label htmlFor="fieldType">Type</Label>
                                <Select
                                    value={newField.type}
                                    onValueChange={(value) =>
                                        setNewField({ ...newField, type: value as FieldType })
                                    }
                                >
                                    <SelectTrigger id="fieldType">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="string">String</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="date">Date</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="secondary" onClick={handleAddField}>
                                Add Field
                            </Button>
                        </div>

                        {newReport.fields && newReport.fields.length > 0 && (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="w-[100px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {newReport.fields.map((field, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{field.name}</TableCell>
                                                <TableCell className="capitalize">{field.type}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveField(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreating(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveReport}>Save Report Config</Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Report Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage report types and their data schemas.
                    </p>
                </div>
                <Button onClick={() => setIsCreating(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New
                </Button>
            </div>
            <Separator />

            <div className="grid gap-4">
                {reports.map((report) => (
                    <Card key={report.id}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-medium">
                                    {report.name}
                                </CardTitle>
                                <CardDescription>{report.description}</CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteReport(report.id)}
                            >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground w-20">Chart:</span>
                                    <span className="capitalize">{report.chartType}</span>
                                </div>
                                <div className="flex items-start text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground w-20">Fields:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {report.fields.map((f, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                            >
                                                {f.name} ({f.type})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {reports.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        No report configurations found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
