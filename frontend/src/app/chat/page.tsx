"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Plus, Trash2, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ChatPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [conversations, setConversations] = useState<any[]>([]);
    const [currentConversation, setCurrentConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [selectedModel, setSelectedModel] = useState("tinyllama:latest");
    const [sending, setSending] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<any>(null);
    const [models, setModels] = useState<string[]>([]);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; conversationId: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchConversations();
        fetchInstalledModels();
    }, []);

    useEffect(() => {
        if (currentConversation) {
            fetchMessages();
        }
    }, [currentConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchInstalledModels = async () => {
        try {
            const res = await api.get("/llm/models");
            const installedModels = res.data
                .filter((m: any) => m.status === 'DOWNLOADED')
                .map((m: any) => m.name);

            // Add 'auto' option
            const modelOptions = ['auto', ...installedModels];
            setModels(modelOptions);

            // Set default model to 'auto' if no model selected or current selection is invalid
            if (!selectedModel || !modelOptions.includes(selectedModel)) {
                setSelectedModel('auto');
            }
        } catch (error) {
            console.error("Failed to fetch models:", error);
            // Fallback
            setModels(["auto", "tinyllama:latest"]);
            if (!selectedModel) setSelectedModel('auto');
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await api.get("/chat/conversations");
            setConversations(res.data);
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/chat/conversations/${currentConversation.id}`);
            setMessages(res.data.messages || []);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const createNewConversation = async () => {
        try {
            const res = await api.post("/chat/conversations", {
                model: selectedModel,
                title: "New Chat"
            });
            setCurrentConversation(res.data);
            setMessages([]);
            fetchConversations();
            return res.data;
        } catch (error) {
            toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
            return null;
        }
    };

    const deleteConversation = async (id: string) => {
        try {
            await api.delete(`/chat/conversations/${id}`);
            if (currentConversation?.id === id) {
                setCurrentConversation(null);
                setMessages([]);
            }
            fetchConversations();
            toast({ title: "Success", description: "Conversation deleted" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete conversation", variant: "destructive" });
        }
    };

    const handleContextMenu = (e: React.MouseEvent, conversationId: string) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            conversationId
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setUploadedFile(res.data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
        }
    };

    const sendMessage = async () => {
        if (!input.trim() && !uploadedFile) return;

        let conversationId = currentConversation?.id;

        if (!conversationId) {
            const newConv = await createNewConversation();
            if (!newConv) return;
            conversationId = newConv.id;
        }

        setSending(true);
        const userMessage = {
            role: "user",
            content: input,
            imageUrl: uploadedFile?.mimetype?.startsWith("image/") ? uploadedFile.url : null,
            fileUrl: uploadedFile && !uploadedFile.mimetype?.startsWith("image/") ? uploadedFile.url : null,
            fileName: uploadedFile?.filename
        };

        // Add user message to UI immediately
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setUploadedFile(null);

        try {
            const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
                content: userMessage.content,
                imageUrl: userMessage.imageUrl,
                fileUrl: userMessage.fileUrl
            });

            // Add assistant response
            setMessages(prev => [...prev, res.data]);

            // Update conversation list to get the new title
            await fetchConversations();

            // Refresh current conversation to get updated title
            if (currentConversation?.title === "New Chat") {
                const updatedConv = await api.get(`/chat/conversations/${conversationId}`);
                setCurrentConversation(updatedConv.data);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-full overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/10 flex flex-col">
                <div className="p-4 border-b">
                    <Button onClick={createNewConversation} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        New Chat
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`p-3 rounded-lg cursor-pointer hover:bg-muted/50 flex items-center justify-between group ${currentConversation?.id === conv.id ? "bg-muted" : ""
                                    }`}
                                onClick={() => setCurrentConversation(conv)}
                                onContextMenu={(e) => handleContextMenu(e, conv.id)}
                            >
                                <div className="flex-1 truncate">
                                    <p className="text-sm font-medium truncate">{conv.title}</p>
                                    <p className="text-xs text-muted-foreground">{conv.model}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteConversation(conv.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Context Menu */}
                {contextMenu && (
                    <div
                        className="fixed bg-popover text-popover-foreground border rounded-md shadow-md py-1 z-50"
                        style={{
                            left: `${contextMenu.x}px`,
                            top: `${contextMenu.y}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="w-full px-4 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                            onClick={() => {
                                deleteConversation(contextMenu.conversationId);
                                setContextMenu(null);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Chat
                        </button>
                    </div>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b p-4 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold flex-1 truncate" title={currentConversation?.title || "Select or create a conversation"}>
                        {currentConversation?.title || "Select or create a conversation"}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Select
                            value={currentConversation?.model || selectedModel}
                            onValueChange={(value) => {
                                if (currentConversation) {
                                    // Update existing conversation's model
                                    api.patch(`/chat/conversations/${currentConversation.id}`, { model: value })
                                        .then(() => {
                                            setCurrentConversation({ ...currentConversation, model: value });
                                            fetchConversations();
                                        });
                                } else {
                                    // Update model for new conversation
                                    setSelectedModel(value);
                                }
                            }}
                        >
                            <SelectTrigger className="w-40 flex-shrink-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map((model) => (
                                    <SelectItem key={model} value={model}>
                                        {model}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {currentConversation && (
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => deleteConversation(currentConversation.id)}
                                title="Delete this conversation"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                    {currentConversation ? (
                        <div className="space-y-4 max-w-3xl mx-auto">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <Card
                                        className={`p-4 max-w-[80%] ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                            }`}
                                    >
                                        {msg.imageUrl && (
                                            <img
                                                src={`http://localhost:3030${msg.imageUrl}`}
                                                alt="Uploaded"
                                                className="max-w-full rounded mb-2"
                                            />
                                        )}
                                        {msg.fileUrl && (
                                            <div className="flex items-center gap-2 mb-2 text-sm">
                                                <Paperclip className="h-4 w-4" />
                                                <span>{msg.fileName}</span>
                                            </div>
                                        )}
                                        <div className="text-sm overflow-hidden">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code({ node, inline, className, children, ...props }: any) {
                                                        const match = /language-(\w+)/.exec(className || '')
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                {...props}
                                                                style={vscDarkPlus}
                                                                language={match[1]}
                                                                PreTag="div"
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code {...props} className={`${className} bg-muted p-1 rounded`}>
                                                                {children}
                                                            </code>
                                                        )
                                                    }
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                            {sending && (
                                <div className="flex justify-start">
                                    <Card className="p-4 bg-muted">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </Card>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Start a new chat below</p>
                        </div>
                    )}
                </ScrollArea>

                {/* Input */}
                <div className="border-t p-4">
                    <div className="max-w-3xl mx-auto">
                        {uploadedFile && (
                            <div className="mb-2 p-2 bg-muted rounded flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {uploadedFile.mimetype?.startsWith("image/") ? (
                                        <ImageIcon className="h-4 w-4" />
                                    ) : (
                                        <Paperclip className="h-4 w-4" />
                                    )}
                                    <span className="text-sm">{uploadedFile.filename}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setUploadedFile(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept="image/*,.pdf,.txt"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                placeholder="Type a message..."
                                disabled={sending}
                                className="flex-1"
                            />
                            <Button onClick={sendMessage} disabled={sending || (!input.trim() && !uploadedFile)}>
                                {sending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
