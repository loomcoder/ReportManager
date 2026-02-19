import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ReportDetailsSelectionProps {
    name: string;
    description: string;
    onNameChange: (name: string) => void;
    onDescriptionChange: (desc: string) => void;
}

export const ReportDetailsSelection: React.FC<ReportDetailsSelectionProps> = ({
    name,
    description,
    onNameChange,
    onDescriptionChange
}) => {
    return (
        <div className="space-y-6 max-w-lg mx-auto">
            <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold">Report Details</h2>
                <p className="text-muted-foreground">Give your report a meaningful name.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input
                        id="report-name"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="e.g., Q3 Sales Performance"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="report-desc">Description (Optional)</Label>
                    <Textarea
                        id="report-desc"
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="What is this report about?"
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
};
