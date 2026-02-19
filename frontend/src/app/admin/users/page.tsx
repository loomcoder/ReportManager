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
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    status: string;
    createdAt: string;
}

interface Role {
    id: string;
    name: string;
    description: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                api.get("/users"),
                api.get("/roles"),
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditRoles = (user: User) => {
        setSelectedUser(user);
        // Map user role names to role IDs
        const userRoleIds = roles
            .filter((r) => user.roles.includes(r.name))
            .map((r) => r.id);
        setSelectedRoleIds(userRoleIds);
        setIsDialogOpen(true);
    };

    const handleRoleToggle = (roleId: string) => {
        setSelectedRoleIds((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleSaveRoles = async () => {
        if (!selectedUser) return;
        try {
            // Map selected role IDs back to role names
            const selectedRoleNames = roles
                .filter(r => selectedRoleIds.includes(r.id))
                .map(r => r.name);

            await api.put(`/users/${selectedUser.id}`, {
                roles: selectedRoleNames,
            });
            setIsDialogOpen(false);
            fetchData(); // Refresh list
        } catch (err) {
            console.error("Failed to update roles", err);
            alert("Failed to update roles");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            {user.firstName} {user.lastName}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {user.roles.map((role) => (
                                                    <Badge key={role} variant="secondary">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.status}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditRoles(user)}
                                            >
                                                Edit Roles
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Roles for {selectedUser?.email}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {roles.map((role) => (
                            <div key={role.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={role.id}
                                    checked={selectedRoleIds.includes(role.id)}
                                    onCheckedChange={() => handleRoleToggle(role.id)}
                                />
                                <Label htmlFor={role.id}>
                                    {role.name} - <span className="text-muted-foreground text-xs">{role.description}</span>
                                </Label>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveRoles}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
