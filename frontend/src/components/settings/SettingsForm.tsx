"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Dashboard, Settings } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function SettingsForm() {
    const [settings, setSettings] = useState<Settings>({});
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, dashboardsRes] = await Promise.all([
                    api.get("/settings"),
                    api.get("/dashboards")
                ]);
                setSettings(settingsRes.data);
                setDashboards(dashboardsRes.data);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put("/settings", settings);
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-4">Loading settings...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard Preferences</CardTitle>
                    <CardDescription>
                        Configure your default dashboard and display preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="default-dashboard">Default Dashboard</Label>
                        <Select
                            value={settings.defaultDashboardId || "none"}
                            onValueChange={(value) => setSettings({
                                ...settings,
                                defaultDashboardId: value === "none" ? null : value
                            })}
                        >
                            <SelectTrigger id="default-dashboard">
                                <SelectValue placeholder="Select a default dashboard" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {dashboards.map((dashboard) => (
                                    <SelectItem key={dashboard.id} value={dashboard.id}>
                                        {dashboard.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            The default dashboard will be highlighted in your dashboard list.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        This is how others will see you on the site.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" placeholder="johndoe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Tell us a little bit about yourself"
                            className="resize-none"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                        Configure how you receive notifications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <Switch
                            id="email-notifications"
                            checked={settings.emailNotifications || false}
                            onCheckedChange={(checked) => setSettings({
                                ...settings,
                                emailNotifications: checked
                            })}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="marketing-emails">Marketing Emails</Label>
                        <Switch id="marketing-emails" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize the look and feel of the application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select
                            value={settings.theme || "light"}
                            onValueChange={(value) => setSettings({
                                ...settings,
                                theme: value
                            })}
                        >
                            <SelectTrigger id="theme">
                                <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save changes"}
                </Button>
            </div>
        </div>
    );
}
