"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const data = [
    {
        name: "Jan",
        total: 167,
    },
    {
        name: "Feb",
        total: 245,
    },
    {
        name: "Mar",
        total: 312,
    },
    {
        name: "Apr",
        total: 289,
    },
    {
        name: "May",
        total: 450,
    },
    {
        name: "Jun",
        total: 380,
    },
];

export function OverviewChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
