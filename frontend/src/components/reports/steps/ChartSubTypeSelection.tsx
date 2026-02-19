import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChartType } from './ChartTypeSelection';
import {
    LineChart,
    BarChart3,
    PieChart,
    ScatterChart,
    Layers,
    AlignLeft,
    Circle,
    Activity,
    Grid
} from "lucide-react";

interface ChartSubTypeSelectionProps {
    parentType: ChartType;
    selectedSubType: string;
    onSelect: (subType: string) => void;
}

interface SubTypeOption {
    id: string;
    label: string;
    description: string;
    icon?: any;
}

const SUB_TYPES: Record<ChartType, SubTypeOption[]> = {
    line: [
        { id: 'basic', label: 'Basic Line', description: 'Standard line chart', icon: LineChart },
        { id: 'smooth', label: 'Smooth Line', description: 'Curved lines', icon: Activity },
        { id: 'step', label: 'Step Line', description: 'Stepped transitions', icon: Activity },
        { id: 'stacked', label: 'Stacked Line', description: 'Cumulative values', icon: Layers },
    ],
    bar: [
        { id: 'basic', label: 'Basic Bar', description: 'Vertical bars', icon: BarChart3 },
        { id: 'stacked', label: 'Stacked Bar', description: 'Stacked vertical bars', icon: Layers },
        { id: 'horizontal', label: 'Horizontal Bar', description: 'Row-oriented bars', icon: AlignLeft },
        { id: 'horizontal_stacked', label: 'Stacked Horizontal', description: 'Stacked row bars', icon: Layers },
    ],
    pie: [
        { id: 'basic', label: 'Basic Pie', description: 'Standard pie chart', icon: PieChart },
        { id: 'doughnut', label: 'Doughnut', description: 'Pie with a hole', icon: Circle },
        { id: 'rose', label: 'Nightingale Rose', description: 'Radius-based pie', icon: PieChart },
    ],
    scatter: [
        { id: 'basic', label: 'Scatter Plot', description: 'Point distribution', icon: ScatterChart },
        { id: 'bubble', label: 'Bubble Chart', description: 'Points with weight', icon: Circle },
    ],
    candlestick: [
        { id: 'basic', label: 'Standard', description: 'OHLC Financial chart', icon: Activity },
    ],
    boxplot: [
        { id: 'basic', label: 'Standard', description: 'Statistical boxplot', icon: Activity },
    ],
    heatmap: [
        { id: 'basic', label: 'Standard', description: '2D Intensity grid', icon: Grid },
    ],
    funnel: [
        { id: 'basic', label: 'Standard', description: 'Conversion funnel', icon: Activity },
    ],
    gauge: [
        { id: 'basic', label: 'Standard', description: 'Speedometer style', icon: Activity },
    ],
    matrix: [
        { id: 'basic', label: 'Standard', description: 'Data matrix', icon: Grid },
    ],
    datatable: [
        { id: 'basic', label: 'Standard', description: 'Interactive table', icon: Grid },
    ],
    pivot: [
        { id: 'basic', label: 'Standard', description: 'Pivot table', icon: Grid },
    ],
};

export const ChartSubTypeSelection: React.FC<ChartSubTypeSelectionProps> = ({ parentType, selectedSubType, onSelect }) => {
    const options = SUB_TYPES[parentType] || [];

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Select Sub-Type</h2>
                <p className="text-muted-foreground">Choose a specific variation of the {parentType} chart.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {options.map((option) => {
                    const Icon = option.icon || Activity;
                    const isSelected = selectedSubType === option.id;
                    return (
                        <Card
                            key={option.id}
                            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                            onClick={() => onSelect(option.id)}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                                <div className={`p-3 rounded-full ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">{option.label}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
