import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface InsightCardProps {
    insight: string;
    isLoading?: boolean;
}

export function InsightCard({ insight, isLoading }: InsightCardProps) {
    return (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-indigo-800 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-indigo-600" />
                    AI Insight
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center space-x-2 animate-pulse">
                        <div className="h-4 w-3/4 bg-indigo-200 rounded"></div>
                    </div>
                ) : (
                    <p className="text-sm text-indigo-900 leading-relaxed">
                        {insight}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
