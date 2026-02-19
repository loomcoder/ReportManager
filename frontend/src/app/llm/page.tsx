"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Download, Play, Loader2, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function LlmPage() {
    const router = useRouter();
    const [models, setModels] = useState<any[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);

    const [pullModelName, setPullModelName] = useState("");

    // Library state
    const [searchQuery, setSearchQuery] = useState("");
    const [downloadingModel, setDownloadingModel] = useState<string | null>(null);



    // Delete confirmation state
    const [modelToDelete, setModelToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { toast } = useToast();

    const POPULAR_MODELS = [
        { name: "llama3", description: "Meta's latest open LLM", size: "4.7GB" },
        { name: "mistral", description: "Mistral AI's 7B model", size: "4.1GB" },
        { name: "gemma", description: "Google's lightweight open model", size: "5.0GB" },
        { name: "phi3", description: "Microsoft's small language model", size: "2.4GB" },
        { name: "neural-chat", description: "Fine-tuned model for chat", size: "4.1GB" },
        { name: "starling-lm", description: "High quality RLHF model", size: "4.1GB" },
        { name: "codellama", description: "Code specialized model", size: "3.8GB" },
        { name: "llava", description: "Multimodal (image+text) model", size: "4.5GB" },
        { name: "tinyllama", description: "Very small 1.1B model", size: "637MB" },
    ];

    const COMPREHENSIVE_MODELS = [
        ...POPULAR_MODELS,
        { name: "llama2", description: "Meta's previous generation LLM", size: "3.8GB" },
        { name: "vicuna", description: "Fine-tuned LLaMA for chat", size: "3.8GB" },
        { name: "orca-mini", description: "Small reasoning model", size: "1.9GB" },
        { name: "wizardcoder", description: "Code generation specialist", size: "3.8GB" },
        { name: "deepseek-coder", description: "Advanced code model", size: "3.8GB" },
        { name: "solar", description: "High performance 10.7B model", size: "6.1GB" },
        { name: "nous-hermes", description: "Instruction-tuned model", size: "3.8GB" },
        { name: "dolphin-mixtral", description: "Uncensored Mixtral variant", size: "26GB" },
        { name: "qwen", description: "Alibaba's multilingual model", size: "4.5GB" },
        { name: "yi", description: "01.AI's bilingual model", size: "4.0GB" },
    ].sort((a, b) => a.name.localeCompare(b.name));

    const filteredLibrary = POPULAR_MODELS.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchModels = async () => {
        setLoadingModels(true);
        try {
            const res = await api.get("/llm/models");
            setModels(res.data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch models", variant: "destructive" });
        } finally {
            setLoadingModels(false);
        }
    };



    useEffect(() => {
        fetchModels();

        // Poll models every 2 seconds for progress updates
        const interval = setInterval(() => {
            fetchModels();
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handlePullModel = async (name: string) => {
        if (!name) return;
        setDownloadingModel(name);

        // Find model size
        const modelInfo = COMPREHENSIVE_MODELS.find(m => m.name === name);
        const size = modelInfo?.size || "Unknown";

        try {
            await api.post("/llm/models/pull", { name, size });
            toast({ title: "Success", description: `Started downloading ${name}` });
            fetchModels();
        } catch (error) {
            toast({ title: "Error", description: "Failed to pull model", variant: "destructive" });
        } finally {
            setDownloadingModel(null);
        }
    };



    const confirmDelete = (name: string) => {
        setModelToDelete(name);
    };

    const handleDeleteModel = async () => {
        if (!modelToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/llm/models/${encodeURIComponent(modelToDelete)}`);
            toast({ title: "Success", description: `Deleted ${modelToDelete}`, duration: 5000 });
            setModelToDelete(null);
            fetchModels();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete model", variant: "destructive", duration: 5000 });
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setModelToDelete(null);
    };

    const isModelDownloaded = (name: string) => {
        return models.some(m => m.name.startsWith(name));
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">LLM Management</h2>
            </div>

            <Tabs defaultValue="library" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="library">Model Library</TabsTrigger>
                    <TabsTrigger value="models">Installed Models</TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Model Library</CardTitle>
                            <CardDescription>Browse and download popular open-source models</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-6">
                                <Input
                                    placeholder="Search models..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="max-w-sm"
                                />
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Size (Approx)</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLibrary.map((model) => {
                                            // Check DB status
                                            const dbModel = models.find(m => m.name.startsWith(model.name));
                                            const isDownloaded = dbModel?.status === 'DOWNLOADED';
                                            const isDownloading = dbModel?.status === 'DOWNLOADING' || downloadingModel === model.name;
                                            const progress = dbModel?.progress || 0;

                                            return (
                                                <TableRow key={model.name}>
                                                    <TableCell className="font-medium">{model.name}</TableCell>
                                                    <TableCell>{model.description}</TableCell>
                                                    <TableCell>{model.size}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {isDownloaded ? (
                                                                <>
                                                                    <Badge variant="secondary">Installed</Badge>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => confirmDelete(dbModel.name)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            ) : isDownloading ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                    <span className="text-xs text-muted-foreground">{progress}%</span>
                                                                    <div className="h-2 w-16 bg-secondary rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-primary transition-all duration-500"
                                                                            style={{ width: `${progress}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handlePullModel(model.name)}
                                                                    disabled={isDownloading}
                                                                >
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Download
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-6 p-4 bg-muted rounded-md">
                                <h4 className="font-semibold mb-2">Download More Models</h4>
                                <div className="flex gap-4">
                                    <Select value={pullModelName} onValueChange={setPullModelName}>
                                        <SelectTrigger className="max-w-sm">
                                            <SelectValue placeholder="Select a model to download" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COMPREHENSIVE_MODELS.map(m => (
                                                <SelectItem key={m.name} value={m.name}>
                                                    {m.name} - {m.description} ({m.size})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={() => handlePullModel(pullModelName)} disabled={!pullModelName || !!downloadingModel}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="models" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Installed Models</CardTitle>
                            <CardDescription>Manage your local models</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-end mb-6">
                                <Button variant="outline" onClick={fetchModels}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Refresh
                                </Button>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Modified</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {models.map((model) => (
                                            <TableRow key={model.name}>
                                                <TableCell className="font-medium">{model.name}</TableCell>
                                                <TableCell>{model.size}</TableCell>
                                                <TableCell>
                                                    <Badge variant={model.status === 'DOWNLOADED' ? 'default' : 'secondary'}>
                                                        {model.status || 'READY'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{model.modified_at || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {model.status === 'DOWNLOADED' && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => confirmDelete(model.name)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {models.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center">No models found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>


            </Tabs>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!modelToDelete} onOpenChange={(open) => !open && cancelDelete()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Model</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{modelToDelete}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteModel} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
