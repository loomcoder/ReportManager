import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface EChartsRendererProps {
    chartType: string;
    subType: string;
    data: any[];
    config: any;
    height?: number | string;
}

// Aggregation Helper
const aggregateData = (data: any[], groupByCol: string, valueCol: string, aggType: string) => {
    if (!aggType || aggType === 'none') {
        return data; // No aggregation
    }

    const groups: Record<string, number[]> = {};

    data.forEach(item => {
        const key = item[groupByCol];
        if (!groups[key]) groups[key] = [];
        groups[key].push(Number(item[valueCol]));
    });

    return Object.keys(groups).map(key => {
        const values = groups[key];
        let result = 0;

        switch (aggType) {
            case 'SUM':
                result = values.reduce((a, b) => a + b, 0);
                break;
            case 'AVG':
                result = values.reduce((a, b) => a + b, 0) / values.length;
                break;
            case 'COUNT':
                result = values.length;
                break;
            case 'MIN':
                result = Math.min(...values);
                break;
            case 'MAX':
                result = Math.max(...values);
                break;
            default:
                result = 0;
        }

        return {
            [groupByCol]: key,
            [valueCol]: result
        };
    });
};

export const EChartsRenderer: React.FC<EChartsRendererProps> = ({ chartType, subType, data, config, height = 400 }) => {

    const option = useMemo(() => {
        if (!data || data.length === 0) return {};

        const { xAxis, yAxis, secondaryXAxis, aggregates } = config;

        // --- Pre-process Data with Aggregation ---
        let processedData = [...data];

        // If Y-Axis has an aggregation, and we have an X-Axis (group by)
        const aggType = aggregates ? aggregates[yAxis] : null;
        if (xAxis && yAxis && aggType && aggType !== 'none') {
            processedData = aggregateData(data, xAxis, yAxis, aggType);
        }

        // Basic Option Structure
        const baseOption: any = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {},
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {},
            yAxis: {},
            series: []
        };

        // --- Data Transformation Logic ---

        // 1. Bar / Line / Scatter
        if (['bar', 'line', 'scatter'].includes(chartType)) {

            baseOption.xAxis = {
                type: 'category',
                data: processedData.map(item => item[xAxis])
            };
            baseOption.yAxis = {
                type: 'value'
            };

            // Single Series
            if (!secondaryXAxis || secondaryXAxis === 'none') {
                baseOption.series.push({
                    name: yAxis,
                    type: chartType,
                    data: processedData.map(item => item[yAxis]),
                    // Apply subtype logic
                    stack: (subType === 'stacked' || subType === 'horizontal_stacked') ? 'total' : undefined,
                    smooth: subType === 'smooth',
                    step: subType === 'step' ? 'start' : undefined
                });

                // Horizontal Logic
                if (chartType === 'bar' && (subType === 'horizontal' || subType === 'horizontal_stacked')) {
                    const temp = baseOption.xAxis;
                    baseOption.xAxis = baseOption.yAxis;
                    baseOption.yAxis = temp;
                }

            } else {
                // Multi-Series (Grouped) with Aggregation
                // If we also have a secondary grouping, aggregation becomes more complex (Pivot-like).
                // Current simple helper doesn't support 2-level grouping. 
                // TODO: Logic for 2-level grouping aggregation if needed.
                // For now, we assume user aggregates on server or provides raw data for multi-series.

                const groups = Array.from(new Set(data.map(item => item[secondaryXAxis])));

                groups.forEach(group => {
                    // Filter data for this group
                    // Note: This logic assumes X-axis values are consistent across groups or we need to align them.
                    // For simplicity, we restart mapping based on the main X-axis categories.

                    const groupData = baseOption.xAxis.data.map((xVal: any) => {
                        const found = data.find(d => d[xAxis] === xVal && d[secondaryXAxis] === group);
                        return found ? found[yAxis] : 0;
                    });

                    baseOption.series.push({
                        name: group,
                        type: chartType,
                        data: groupData,
                        stack: (subType === 'stacked' || subType === 'horizontal_stacked') ? 'total' : undefined
                    });
                });
            }
        }

        // 2. Pie Chart
        else if (chartType === 'pie') {
            baseOption.tooltip = { trigger: 'item' };
            baseOption.xAxis = undefined;
            baseOption.yAxis = undefined;
            baseOption.grid = undefined;

            baseOption.series.push({
                name: yAxis,
                type: 'pie',
                radius: subType === 'doughnut' ? ['40%', '70%'] : '50%',
                roseType: subType === 'rose' ? 'area' : undefined,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                data: processedData.map(item => ({
                    value: item[yAxis],
                    name: item[xAxis]
                }))
            });
        }

        // TODO: Add other chart types

        return baseOption;
    }, [chartType, subType, data, config]);

    return (
        <ReactECharts
            option={option}
            style={{ height: height, width: '100%' }}
            opts={{ renderer: 'canvas' }}
        />
    );
};
