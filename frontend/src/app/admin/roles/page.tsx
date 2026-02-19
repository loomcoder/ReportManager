"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
}

interface Module {
    id: string;
    name: string;
    description: string;
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesRes, modulesRes] = await Promise.all([
                api.get("/roles"),
                api.get("/modules"),
            ]);
            setRoles(rolesRes.data);
            setModules(modulesRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingRole(null);
        setName("");
        setDescription("");
        setSelectedPermissions([]);
        setIsDialogOpen(true);
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setName(role.name);
        setDescription(role.description || "");
        setSelectedPermissions(role.permissions || []);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this role?")) return;
        try {
            await api.delete(`/roles/${id}`);
            fetchData();
        } catch (err) {
            console.error("Failed to delete role", err);
            alert("Failed to delete role");
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                name,
                description,
                permissions: selectedPermissions,
            };

            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, payload);
            } else {
                await api.post("/roles", payload);
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (err) {
            console.error("Failed to save role", err);
            alert("Failed to save role");
        }
    };

    const togglePermission = (key: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(key)
                ? prev.filter((p) => p !== key)
                : [...prev, key]
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
                <Button onClick={handleCreate}>Create Role</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium">{role.name}</TableCell>
                                        <TableCell>{role.description}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {role.permissions?.map((p) => (
                                                    <Badge key={p} variant="secondary" className="text-xs">
                                                        {modules.find(m => m.name === p)?.name || p}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(role)}>
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(role.id)}
                                                    disabled={role.name === "ADMIN" || role.name === "USER"}
                                                >
                                                    Delete
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Role Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={editingRole?.name === "ADMIN" || editingRole?.name === "USER"}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Permissions (Modules)</Label>
                            <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                                {modules.map((module) => (
                                    <div key={module.id} className="flex items-start space-x-2">
                                        <Checkbox
                                            id={module.id}
                                            checked={selectedPermissions.includes(module.name)}
                                            onCheckedChange={() => togglePermission(module.name)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor={module.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {module.name}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {module.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
