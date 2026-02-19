'use client';

import React from 'react';
import { CubeProvider } from '@cubejs-client/react';
import cubeClient from '@/lib/cubeClient';
import { MetricCard } from '@/components/analytics/MetricCard';
import { CubeChart } from '@/components/analytics/CubeChart';
import {
    FileText,
    Database,
    LayoutDashboard,
    Users,
    Calendar
} from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <CubeProvider cubeApi={cubeClient}>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Powered by Cube.js - Advanced BI analytics for your reports and data
                    </p>
                </div>

                {/* KPI Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <MetricCard
                        title="Total Reports"
                        icon={<FileText className="h-4 w-4" />}
                        query={{
                            measures: ['Reports.count']
                        }}
                    />

                    <MetricCard
                        title="Data Sources"
                        icon={<Database className="h-4 w-4" />}
                        query={{
                            measures: ['DataSources.count']
                        }}
                    />

                    <MetricCard
                        title="Active Data Sources"
                        icon={<Database className="h-4 w-4" />}
                        query={{
                            measures: ['DataSources.activeCount']
                        }}
                    />

                    <MetricCard
                        title="Dashboards"
                        icon={<LayoutDashboard className="h-4 w-4" />}
                        query={{
                            measures: ['Dashboards.count']
                        }}
                    />

                    <MetricCard
                        title="Total Users"
                        icon={<Users className="h-4 w-4" />}
                        query={{
                            measures: ['Users.count']
                        }}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    <CubeChart
                        title="Report Creation Trends"
                        chartType="line"
                        xAxisKey="x"
                        yAxisKey="Reports.count"
                        query={{
                            measures: ['Reports.count'],
                            timeDimensions: [
                                {
                                    dimension: 'Reports.createdAt',
                                    granularity: 'day',
                                    dateRange: 'last 30 days'
                                }
                            ]
                        }}
                    />

                    <CubeChart
                        title="Data Sources by Type"
                        chartType="pie"
                        xAxisKey="DataSources.type"
                        yAxisKey="DataSources.count"
                        query={{
                            measures: ['DataSources.count'],
                            dimensions: ['DataSources.type']
                        }}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <CubeChart
                        title="Dashboard Creation Over Time"
                        chartType="area"
                        xAxisKey="x"
                        yAxisKey="Dashboards.count"
                        query={{
                            measures: ['Dashboards.count'],
                            timeDimensions: [
                                {
                                    dimension: 'Dashboards.createdAt',
                                    granularity: 'day',
                                    dateRange: 'last 30 days'
                                }
                            ]
                        }}
                    />

                    <CubeChart
                        title="User Registration Trends"
                        chartType="bar"
                        xAxisKey="x"
                        yAxisKey="Users.count"
                        query={{
                            measures: ['Users.count'],
                            timeDimensions: [
                                {
                                    dimension: 'Users.createdAt',
                                    granularity: 'day',
                                    dateRange: 'last 30 days'
                                }
                            ]
                        }}
                    />
                </div>

                {/* User Role Distribution */}
                <div className="grid gap-4 md:grid-cols-3">
                    <MetricCard
                        title="Admin Users"
                        icon={<Users className="h-4 w-4" />}
                        query={{
                            measures: ['Users.adminCount']
                        }}
                    />

                    <MetricCard
                        title="Regular Users"
                        icon={<Users className="h-4 w-4" />}
                        query={{
                            measures: ['Users.regularUserCount']
                        }}
                    />

                    <MetricCard
                        title="Managers"
                        icon={<Users className="h-4 w-4" />}
                        query={{
                            measures: ['Users.managerCount']
                        }}
                    />
                </div>

                {/* Schedule Statistics */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-4 md:grid-cols-2">
                        <MetricCard
                            title="Total Schedules"
                            icon={<Calendar className="h-4 w-4" />}
                            query={{
                                measures: ['Schedules.count']
                            }}
                        />

                        <MetricCard
                            title="Active Schedules"
                            icon={<Calendar className="h-4 w-4" />}
                            query={{
                                measures: ['Schedules.activeCount']
                            }}
                        />
                    </div>

                    <CubeChart
                        title="Schedules by Task Type"
                        chartType="bar"
                        xAxisKey="Schedules.taskType"
                        yAxisKey="Schedules.count"
                        query={{
                            measures: ['Schedules.count'],
                            dimensions: ['Schedules.taskType']
                        }}
                    />
                </div>
            </div>
        </CubeProvider>
    );
}
