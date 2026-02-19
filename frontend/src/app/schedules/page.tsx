"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calendar, Play } from "lucide-react";

interface ScheduledJob {
    id: string;
    name: string;
    cronExpression: string;
    taskType: string;
    targetId?: string;
    isActive: boolean;
    createdAt: string;
}

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<ScheduledJob[]>([]);
    const [newSchedule, setNewSchedule] = useState({
        name: "",
        cronExpression: "",
        taskType: "generate_report",
        targetId: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const res = await api.get("/schedules");
            setSchedules(res.data);
        } catch (err) {
            console.error("Failed to fetch schedules", err);
            setError("Failed to load schedules");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/schedules", newSchedule);
            setNewSchedule({ name: "", cronExpression: "", taskType: "generate_report", targetId: "" });
            fetchSchedules();
        } catch (err) {
            console.error("Failed to create schedule", err);
            setError("Failed to create schedule");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;
        try {
            await api.delete(`/schedules/${id}`);
            setSchedules(schedules.filter((s) => s.id !== id));
        } catch (err) {
            console.error("Failed to delete schedule", err);
            setError("Failed to delete schedule");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Schedules</h1>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <Input
                                    value={newSchedule.name}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                    placeholder="Daily Sales Report"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cron Expression</label>
                                <Input
                                    value={newSchedule.cronExpression}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, cronExpression: e.target.value })}
                                    placeholder="0 9 * * *"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: Minute Hour Day Month DayOfWeek</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Task Type</label>
                                <select
                                    className="w-full p-2 border rounded-md bg-background"
                                    value={newSchedule.taskType}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, taskType: e.target.value })}
                                >
                                    <option value="generate_report">Generate Report</option>
                                    <option value="refresh_dashboard">Refresh Dashboard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Target ID (Optional)</label>
                                <Input
                                    value={newSchedule.targetId}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, targetId: e.target.value })}
                                    placeholder="Report or Dashboard ID"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" /> Create Schedule
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Active Schedules</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : schedules.length === 0 ? (
                        <p className="text-gray-500">No active schedules found.</p>
                    ) : (
                        schedules.map((schedule) => (
                            <Card key={schedule.id}>
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">{schedule.name}</h3>
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Calendar className="h-3 w-3" /> {schedule.cronExpression}
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Play className="h-3 w-3" /> {schedule.taskType}
                                        </div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDelete(schedule.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
