import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    LineChart,
    BarChart3,
    PieChart,
    ScatterChart,
    TrendingUp, // For Candlestick
    BoxSelect, // For Boxplot
    Grid, // For Heatmap
    Filter, // For Funnel
    Gauge,
    Grid3X3, // For Matrix
    TableProperties, // For Datatable
    Columns // For Pivot
} from "lucide-react";

export type ChartType =
    | 'line'
    | 'bar'
    | 'pie'
    | 'scatter'
    | 'candlestick'
    | 'boxplot'
    | 'heatmap'
    | 'funnel'
    | 'gauge'
    | 'matrix'
    | 'datatable'
    | 'pivot';

interface ChartTypeSelectionProps {
    selectedType: ChartType | string;
    onSelect: (type: ChartType) => void;
}

const CHART_TYPES: { id: ChartType; label: string; icon: any; description: string }[] = [
    { id: 'line', label: 'Line Chart', icon: LineChart, description: 'Trends over time' },
    { id: 'bar', label: 'Bar Chart', icon: BarChart3, description: 'Categorical comparisons' },
    { id: 'pie', label: 'Pie Chart', icon: PieChart, description: 'Proportions and percentages' },
    { id: 'scatter', label: 'Scatter Plot', icon: ScatterChart, description: 'Correlations between variables' },
    { id: 'candlestick', label: 'Candlestick', icon: TrendingUp, description: 'Financial or stock data' },
    { id: 'boxplot', label: 'Boxplot', icon: BoxSelect, description: 'Statistical distribution' },
    { id: 'heatmap', label: 'Heatmap', icon: Grid, description: 'Intensity across a matrix' },
    { id: 'funnel', label: 'Funnel', icon: Filter, description: 'Process stages' },
    { id: 'gauge', label: 'Gauge', icon: Gauge, description: 'Single metric progress' },
    { id: 'matrix', label: 'Matrix', icon: Grid3X3, description: 'Multidimensional data grid' },
    { id: 'datatable', label: 'Datatable', icon: TableProperties, description: 'Raw data view' },
    { id: 'pivot', label: 'Pivot Table', icon: Columns, description: 'Cross-tabulation summary' },
];

export const ChartTypeSelection: React.FC<ChartTypeSelectionProps> = ({ selectedType, onSelect }) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Select Chart Type</h2>
                <p className="text-muted-foreground">Choose the best visualization for your data.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {CHART_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                        <Card
                            key={type.id}
                            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                            onClick={() => onSelect(type.id)}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                                <div className={`p-3 rounded-full ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">{type.label}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
