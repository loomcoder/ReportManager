"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, AlertCircle } from "lucide-react";

interface AIConfig {
    id: string;
    provider: string;
    apiKey: string | null;
    model: string | null;
    isActive: boolean;
}

const PROVIDERS = [
    { id: "local", name: "Local LLM (Ollama)", needsKey: false },
    { id: "google", name: "Google AI Studio", needsKey: true },
    { id: "openai", name: "OpenAI", needsKey: true },
    { id: "anthropic", name: "Anthropic Claude", needsKey: true },
    { id: "huggingface", name: "Hugging Face", needsKey: true },
    { id: "openrouter", name: "OpenRouter", needsKey: true },
    { id: "puter", name: "Puter.js", needsKey: false }, // Assuming no key for basic usage or handled differently
];

export default function AIInsightsPage() {
    const { toast } = useToast();
    const [configs, setConfigs] = useState<AIConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [providerModels, setProviderModels] = useState<Record<string, string[]>>({});
    const [loadingModels, setLoadingModels] = useState<Record<string, boolean>>({});

    // Insight Generation State
    const [context, setContext] = useState("");
    const [dataInput, setDataInput] = useState("");
    const [selectedProvider, setSelectedProvider] = useState<string>("local");
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<string>("");

    useEffect(() => {
        fetchConfigs();
    }, []);

    useEffect(() => {
        // Fetch models for all configured providers
        configs.forEach(c => {
            if (c.apiKey || c.provider === 'local') {
                fetchModels(c.provider);
            }
        });
        // Also fetch for local if not in configs (it usually is if we have defaults, but just in case)
        if (!configs.find(c => c.provider === 'local')) {
            fetchModels('local');
        }
    }, [configs]);

    const fetchConfigs = async () => {
        try {
            const res = await api.get("/ai/config");
            setConfigs(res.data);

            // Set default selected provider to active one
            const active = res.data.find((c: AIConfig) => c.isActive);
            if (active) {
                setSelectedProvider(active.provider);
                setSelectedModel(active.model || "");
            }
        } catch (error) {
            console.error("Failed to fetch configs", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchModels = async (providerId: string) => {
        setLoadingModels(prev => ({ ...prev, [providerId]: true }));
        try {
            const res = await api.get(`/ai/models/${providerId}`);
            setProviderModels(prev => ({ ...prev, [providerId]: res.data.models }));
        } catch (error) {
            console.error(`Failed to fetch models for ${providerId}`, error);
            setProviderModels(prev => ({ ...prev, [providerId]: [] }));
        } finally {
            setLoadingModels(prev => ({ ...prev, [providerId]: false }));
        }
    };

    const handleSaveConfig = async (providerId: string, apiKey: string, model: string) => {
        try {
            await api.post("/ai/config", { provider: providerId, apiKey, model });
            toast({ title: "Success", description: "Configuration saved" });
            fetchConfigs(); // This will trigger model fetch via useEffect
        } catch (error) {
            toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" });
        }
    };

    const handleSetActive = async (providerId: string) => {
        try {
            await api.post("/ai/config/active", { provider: providerId });
            toast({ title: "Success", description: "Active provider updated" });
            fetchConfigs();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update active provider", variant: "destructive" });
        }
    };

    const handleGenerate = async () => {
        if (!context) {
            toast({ title: "Error", description: "Please enter context/prompt", variant: "destructive" });
            return;
        }

        setGenerating(true);
        setResult("");

        try {
            let parsedData = {};
            try {
                parsedData = dataInput ? JSON.parse(dataInput) : {};
            } catch (e) {
                // If not JSON, treat as raw text in a wrapper
                parsedData = { text: dataInput };
            }

            const res = await api.post("/ai/analyze", {
                context: "general_insight", // Using a generic context for this page
                data: { ...parsedData, userPrompt: context },
                provider: selectedProvider,
                model: selectedModel
            });

            setResult(res.data.result);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to generate insights",
                variant: "destructive"
            });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
            </div>

            <Tabs defaultValue="insights" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="insights">Generate Insights</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate AI Insights</CardTitle>
                            <CardDescription>
                                Analyze data or text using your preferred AI provider.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Provider</Label>
                                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PROVIDERS.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Model (Optional override)</Label>
                                    {providerModels[selectedProvider]?.length > 0 ? (
                                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingModels[selectedProvider] ? "Loading..." : "Select Model"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {providerModels[selectedProvider].map(m => (
                                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            placeholder="e.g. gpt-4, gemini-pro"
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Prompt / Context</Label>
                                <Textarea
                                    placeholder="What would you like to know about this data?"
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Data (JSON or Text)</Label>
                                <Textarea
                                    placeholder='{"sales": 100, "growth": "15%"}'
                                    className="font-mono"
                                    rows={5}
                                    value={dataInput}
                                    onChange={(e) => setDataInput(e.target.value)}
                                />
                            </div>

                            <Button onClick={handleGenerate} disabled={generating}>
                                {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate Insights
                            </Button>

                            {result && (
                                <div className="mt-4 p-4 border rounded-md bg-muted/50">
                                    <h3 className="font-semibold mb-2">Result:</h3>
                                    <div className="whitespace-pre-wrap">{result}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {PROVIDERS.map((provider) => {
                            const config = configs.find(c => c.provider === provider.id);
                            const models = providerModels[provider.id] || [];
                            const isLoading = loadingModels[provider.id];

                            return (
                                <Card key={provider.id}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {provider.name}
                                        </CardTitle>
                                        {config?.isActive && <Check className="h-4 w-4 text-green-500" />}
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        {provider.needsKey && (
                                            <div className="space-y-2">
                                                <Label>API Key</Label>
                                                <Input
                                                    type="password"
                                                    placeholder="sk-..."
                                                    defaultValue={config?.apiKey || ""}
                                                    id={`key-${provider.id}`}
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>Default Model</Label>
                                            {models.length > 0 ? (
                                                <Select
                                                    defaultValue={config?.model || ""}
                                                    onValueChange={(val) => {
                                                        // We need to store this temporarily or just rely on Save button reading from a hidden input?
                                                        // Select component doesn't have a simple "id" to read value from DOM easily like Input.
                                                        // We should use state or a hidden input.
                                                        // Let's use a hidden input to bridge with the existing Save logic.
                                                        const hiddenInput = document.getElementById(`model-${provider.id}`) as HTMLInputElement;
                                                        if (hiddenInput) hiddenInput.value = val;
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={isLoading ? "Loading..." : "Select Model"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {models.map(m => (
                                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                    {/* Hidden input to store value for the Save button handler */}
                                                    <input type="hidden" id={`model-${provider.id}`} defaultValue={config?.model || ""} />
                                                </Select>
                                            ) : (
                                                <Input
                                                    placeholder="Model name"
                                                    defaultValue={config?.model || ""}
                                                    id={`model-${provider.id}`}
                                                />
                                            )}
                                        </div>
                                        <div className="flex justify-between pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const keyInput = document.getElementById(`key-${provider.id}`) as HTMLInputElement;
                                                    const modelInput = document.getElementById(`model-${provider.id}`) as HTMLInputElement;
                                                    handleSaveConfig(
                                                        provider.id,
                                                        keyInput?.value || "",
                                                        modelInput?.value || ""
                                                    );
                                                }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant={config?.isActive ? "secondary" : "default"}
                                                size="sm"
                                                onClick={() => handleSetActive(provider.id)}
                                                disabled={config?.isActive}
                                            >
                                                {config?.isActive ? "Active" : "Set Active"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
