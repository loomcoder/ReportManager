"use client";

import React, { useState } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Sample Data ---
const timeSeriesData = [
    { name: "Jan", value: 400, value2: 240 },
    { name: "Feb", value: 300, value2: 139 },
    { name: "Mar", value: 200, value2: 980 },
    { name: "Apr", value: 278, value2: 390 },
    { name: "May", value: 189, value2: 480 },
    { name: "Jun", value: 239, value2: 380 },
];

const categoricalData = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 300 },
    { name: "Group D", value: 200 },
];

const scatterData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// --- Type Definitions ---

type ChartExample = {
    id: string;
    title: string;
    description: string;
    bestUse: string;
    dataSchema: string;
    sampleData: any[];
    component: React.ReactNode;
};

const CHART_EXAMPLES: ChartExample[] = [
    {
        id: "line",
        title: "Line Chart",
        description:
            "A Line Chart connects individual data points in a view. They provide a clear way to see trends over time.",
        bestUse: "Visualizing trends over a period of time (e.g., Monthly Sales, Stock Prices).",
        sampleData: timeSeriesData,
        dataSchema: `[
  {
    "name": "string (X-Axis Label)",
    "value": "number (Y-Axis Value)",
    "value2": "number (Optional Series)"
  }
]`,
        component: (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="value2" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        ),
    },
    {
        id: "bar",
        title: "Bar Chart",
        description:
            "A Bar Chart presents categorical data with rectangular bars with heights or lengths proportional to the values that they represent.",
        bestUse: "Comparing quantities across different categories (e.g., User Count by Country).",
        sampleData: timeSeriesData,
        dataSchema: `[
  {
    "name": "string (Category Name)",
    "value": "number (Measure)"
  }
]`,
        component: (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                    <Bar dataKey="value2" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
        ),
    },
    {
        id: "area",
        title: "Area Chart",
        description:
            "An Area Chart is based on the line chart. The area between the axis and line is filled with colors or patterns.",
        bestUse: "Showing the magnitude of change over time (e.g., Accumulated Revenue).",
        sampleData: timeSeriesData,
        dataSchema: `[
  {
    "name": "string (Time/Category)",
    "value": "number (Metric A)",
    "value2": "number (Metric B)"
  }
]`,
        component: (
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="value" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="value2" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
            </ResponsiveContainer>
        ),
    },
    {
        id: "pie",
        title: "Pie Chart",
        description:
            "A Pie Chart is a circular statistical graphic, which is divided into slices to illustrate numerical proportion.",
        bestUse: "Showing part-to-whole relationships (e.g., Market Share, Browser Usage).",
        sampleData: categoricalData,
        dataSchema: `[
  {
    "name": "string (Slice Label)",
    "value": "number (Slice Size)"
  }
]`,
        component: (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={categoricalData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={(props: any) => {
                            const { name, percent } = props;
                            return `${name} ${((percent || 0) * 100).toFixed(0)}%`;
                        }}
                    >
                        {categoricalData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        ),
    },
    {
        id: "scatter",
        title: "Scatter Chart",
        description:
            "A Scatter Chart uses Cartesian coordinates to display values for typically two variables for a set of data.",
        bestUse: "Identifying relationships or correlations between values (e.g., Height vs Weight).",
        sampleData: scatterData,
        dataSchema: `[
  {
    "x": "number (X-Axis Value)",
    "y": "number (Y-Axis Value)",
    "z": "number (Optional Z-Index/Size)"
  }
]`,
        component: (
            <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name="stature" unit="cm" />
                    <YAxis type="number" dataKey="y" name="weight" unit="kg" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter name="A school" data={scatterData} fill="#8884d8" />
                </ScatterChart>
            </ResponsiveContainer>
        ),
    },
];

export function ReportShowcase() {
    const [activeTab, setActiveTab] = useState(CHART_EXAMPLES[0].id);

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Report Setup Library</h2>
                <p className="text-muted-foreground">
                    Explore the available report types and their data requirements. Use this guide to structure your data for the Report Manager.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex flex-wrap h-auto p-1 bg-muted/50 rounded-lg mb-6">
                    {CHART_EXAMPLES.map((chart) => (
                        <TabsTrigger key={chart.id} value={chart.id} className="flex-1 min-w-[100px]">
                            {chart.title}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {CHART_EXAMPLES.map((chart) => (
                    <TabsContent key={chart.id} value={chart.id} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left Column: Visual & Description */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{chart.title} Preview</CardTitle>
                                        <CardDescription>
                                            Visual representation using sample data.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-0">
                                        {chart.component}
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Best For</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-balance leading-relaxed">
                                                {chart.bestUse}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Description</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-balance leading-relaxed text-muted-foreground">
                                                {chart.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Right Column: Technical Specs */}
                            <div className="lg:col-span-1">
                                <Card className="h-full border-l-4 border-l-primary">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            Data Requirements
                                            <Badge variant="secondary" className="ml-auto">JSON</Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            Required structure for the dataset.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="rounded-md bg-slate-950 p-4">
                                            <pre className="text-xs text-slate-50 font-mono overflow-x-auto">
                                                {chart.dataSchema}
                                            </pre>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-2">
                                            <p>
                                                <strong>Note:</strong> Ensure your API or query returns an array of objects matching this structure.
                                            </p>
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li>Keys must match exactly.</li>
                                                <li>Numbers should be raw integers/floats.</li>
                                                <li>Dates can be ISO strings or timestamps.</li>
                                            </ul>
                                        </div>
                                        <Button variant="outline" className="w-full text-xs" size="sm">
                                            <Copy className="mr-2 h-3 w-3" />
                                            Copy Schema Template
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                        </div>

                        {/* Bottom: Sample Data Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TableIcon className="h-5 w-5" />
                                    Sample Data Table
                                </CardTitle>
                                <CardDescription>
                                    This is the actual data used to render the chart above.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <ScrollArea className="h-[200px]">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {Object.keys(chart.sampleData[0] || {}).map(key => (
                                                        <TableHead key={key} className="capitalize">{key}</TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {chart.sampleData.map((row, i) => (
                                                    <TableRow key={i}>
                                                        {Object.values(row).map((val: any, j) => (
                                                            <TableCell key={j}>{String(val)}</TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </div>
                            </CardContent>
                        </Card>

                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
