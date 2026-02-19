"use client";

import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileMetadata } from "@/types";
import { Upload, File, X, FileSpreadsheet, FileText } from "lucide-react";

interface FileUploaderProps {
    type: 'excel' | 'csv';
    fileMetadata?: Partial<FileMetadata>;
    onFileSelect: (file: File, metadata: Partial<FileMetadata>) => void;
    onFileRemove?: () => void;
}

export function FileUploader({ type, fileMetadata, onFileSelect, onFileRemove }: FileUploaderProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [sheetName, setSheetName] = useState(fileMetadata?.sheetName || '');
    const [delimiter, setDelimiter] = useState(fileMetadata?.delimiter || ',');
    const [hasHeader, setHasHeader] = useState(fileMetadata?.hasHeader ?? true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        const validTypes = type === 'excel'
            ? ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
            : ['text/csv', 'application/csv'];

        const validExtensions = type === 'excel' ? ['.xlsx', '.xls'] : ['.csv'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            alert(`Please select a valid ${type.toUpperCase()} file`);
            return;
        }

        setSelectedFile(file);

        const metadata: Partial<FileMetadata> = {
            fileName: file.name,
            fileSize: file.size,
        };

        if (type === 'excel') {
            metadata.sheetName = sheetName || 'Sheet1';
        } else {
            metadata.delimiter = delimiter;
            metadata.hasHeader = hasHeader;
        }

        onFileSelect(file, metadata);
    };

    const handleRemove = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onFileRemove) {
            onFileRemove();
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const updateMetadata = () => {
        if (selectedFile) {
            const metadata: Partial<FileMetadata> = {
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
            };

            if (type === 'excel') {
                metadata.sheetName = sheetName;
            } else {
                metadata.delimiter = delimiter;
                metadata.hasHeader = hasHeader;
            }

            onFileSelect(selectedFile, metadata);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {type === 'excel' ? <FileSpreadsheet className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    {type === 'excel' ? 'Excel File Upload' : 'CSV File Upload'}
                </CardTitle>
                <CardDescription>
                    Upload your {type.toUpperCase()} file to use as a data source
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!selectedFile && !fileMetadata?.fileName ? (
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept={type === 'excel' ? '.xlsx,.xls' : '.csv'}
                            onChange={handleChange}
                        />
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                            Drag and drop your {type.toUpperCase()} file here, or
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Browse Files
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                            {type === 'excel' ? 'Supports .xlsx and .xls files' : 'Supports .csv files'} (Max 50MB)
                        </p>
                    </div>
                ) : (
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                {type === 'excel' ? (
                                    <FileSpreadsheet className="h-10 w-10 text-green-600" />
                                ) : (
                                    <FileText className="h-10 w-10 text-blue-600" />
                                )}
                                <div>
                                    <p className="font-medium text-sm">{selectedFile?.name || fileMetadata?.fileName}</p>
                                    <p className="text-xs text-gray-500">
                                        {selectedFile ? formatFileSize(selectedFile.size) : (fileMetadata?.fileSize ? formatFileSize(fileMetadata.fileSize) : 'Unknown size')}
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleRemove}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {selectedFile && type === 'excel' && (
                    <div className="space-y-2">
                        <Label htmlFor="sheetName">Sheet Name (Optional)</Label>
                        <Input
                            id="sheetName"
                            placeholder="Sheet1"
                            value={sheetName}
                            onChange={(e) => {
                                setSheetName(e.target.value);
                            }}
                            onBlur={updateMetadata}
                        />
                        <p className="text-xs text-gray-500">
                            Leave empty to use the first sheet
                        </p>
                    </div>
                )}

                {selectedFile && type === 'csv' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="delimiter">Delimiter</Label>
                            <select
                                id="delimiter"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={delimiter}
                                onChange={(e) => {
                                    setDelimiter(e.target.value);
                                }}
                                onBlur={updateMetadata}
                            >
                                <option value=",">Comma (,)</option>
                                <option value=";">Semicolon (;)</option>
                                <option value="\t">Tab</option>
                                <option value="|">Pipe (|)</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="hasHeader"
                                checked={hasHeader}
                                onChange={(e) => {
                                    setHasHeader(e.target.checked);
                                }}
                                onBlur={updateMetadata}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="hasHeader" className="cursor-pointer">
                                First row contains headers
                            </Label>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
