"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Dashboard, Settings } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, LayoutDashboard, RefreshCw, Trash2, Edit, Star } from "lucide-react";
import Link from "next/link";

export default function DashboardsPage() {
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [settings, setSettings] = useState<Settings>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);

    // Form state
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");

    const fetchDashboards = async () => {
        setIsLoading(true);
        try {
            const [dashboardsRes, settingsRes] = await Promise.all([
                api.get("/dashboards"),
                api.get("/settings")
            ]);
            setDashboards(dashboardsRes.data);
            setSettings(settingsRes.data);
            setError("");
        } catch (err: any) {
            console.error("Failed to fetch dashboards:", err);
            setError("Failed to load dashboards. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboards();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/dashboards", {
                name: newName,
                description: newDescription,
                layout: []
            });

            setNewName("");
            setNewDescription("");
            setIsCreating(false);
            fetchDashboards();
        } catch (err: any) {
            console.error("Failed to create dashboard:", err);
            alert("Failed to create dashboard");
        }
    };

    const handleEdit = (dashboard: Dashboard) => {
        setEditingDashboard(dashboard);
        setNewName(dashboard.name);
        setNewDescription(dashboard.description || "");
        setIsEditing(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDashboard) return;

        try {
            await api.put(`/dashboards/${editingDashboard.id}`, {
                name: newName,
                description: newDescription
            });

            setNewName("");
            setNewDescription("");
            setIsEditing(false);
            setEditingDashboard(null);
            fetchDashboards();
        } catch (err: any) {
            console.error("Failed to update dashboard:", err);
            alert("Failed to update dashboard");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this dashboard?")) return;
        try {
            await api.delete(`/dashboards/${id}`);
            // If deleted dashboard was the default, clear it
            if (settings.defaultDashboardId === id) {
                await api.put("/settings", { defaultDashboardId: null });
            }
            fetchDashboards();
        } catch (err: any) {
            console.error("Failed to delete dashboard:", err);
            alert("Failed to delete dashboard");
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await api.put("/settings", { defaultDashboardId: id });
            setSettings({ ...settings, defaultDashboardId: id });
        } catch (err: any) {
            console.error("Failed to set default dashboard:", err);
            alert("Failed to set default dashboard");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboards</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={fetchDashboards}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => setIsCreating(!isCreating)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Dashboard
                    </Button>
                </div>
            </div>

            {isCreating && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Dashboard</CardTitle>
                        <CardDescription>Design a new dashboard for your reports.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Executive Overview"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="High-level metrics"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit">Create</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Dashboard</DialogTitle>
                        <DialogDescription>Update dashboard name and description.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Executive Overview"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="High-level metrics"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                                setIsEditing(false);
                                setEditingDashboard(null);
                                setNewName("");
                                setNewDescription("");
                            }}>Cancel</Button>
                            <Button type="submit">Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Dashboards</CardTitle>
                    <CardDescription>Manage your analytics dashboards.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : dashboards.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No dashboards found. Create one to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dashboards.map((dashboard) => (
                                    <TableRow key={dashboard.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <Link href={`/dashboards/${dashboard.id}`} className="hover:underline">
                                                    {dashboard.name}
                                                </Link>
                                                {settings.defaultDashboardId === dashboard.id && (
                                                    <span title="Default Dashboard">
                                                        <Star className="ml-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{dashboard.description || "-"}</TableCell>
                                        <TableCell>{new Date(dashboard.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleSetDefault(dashboard.id)}
                                                    title="Set as default"
                                                >
                                                    <Star className={`h-4 w-4 ${settings.defaultDashboardId === dashboard.id ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(dashboard)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(dashboard.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
