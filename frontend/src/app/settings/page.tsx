import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your account settings",
};

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    This is how others will see you on the site.
                </p>
            </div>
            <Separator />
            <SettingsForm />
        </div>
    );
}
