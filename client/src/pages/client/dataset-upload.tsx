import { useState, useCallback } from "react";
import { Link, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import ClientLayout from "@/components/client-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  X,
  AlertCircle,
  FileText,
  File
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "complete" | "error";
  progress: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(type: string) {
  if (type.includes("spreadsheet") || type.includes("csv") || type.includes("excel")) {
    return <FileSpreadsheet className="h-5 w-5 text-chart-2" />;
  }
  if (type.includes("text") || type.includes("json")) {
    return <FileText className="h-5 w-5 text-chart-1" />;
  }
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function UploadedFileCard({
  file,
  onRemove
}: {
  file: UploadedFile;
  onRemove: () => void;
}) {
  return (
    <Card className="border-card-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            {getFileIcon(file.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium truncate">{file.name}</p>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 h-8 w-8"
                onClick={onRemove}
                data-testid={`button-remove-${file.id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              {file.status === "complete" && (
                <span className="flex items-center gap-1 text-sm text-chart-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Uploaded
                </span>
              )}
              {file.status === "error" && (
                <span className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Failed
                </span>
              )}
            </div>
            {file.status === "uploading" && (
              <Progress value={file.progress} className="mt-2 h-1.5" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DatasetUploadPage() {
  const { id } = useParams<{ id: string }>();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = async (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    };

    setFiles(prev => [...prev, newFile]);

    try {
      let data: any[] = [];
      let columns: any[] = [];

      // Simple parsing logic
      const text = await file.text();
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            data = parsed;
            columns = Object.keys(parsed[0]).map(k => ({ name: k, type: typeof parsed[0][k], sampleValues: [] }));
          }
        } catch (e) {
          console.error("JSON Parse error", e);
        }
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        const lines = text.split('\n');
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim());
          columns = headers.map(h => ({ name: h, type: "string", sampleValues: [] }));
          // Parse rows (limit to 100 for brevity in demo)
          for (let i = 1; i < Math.min(lines.length, 100); i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',');
            const row: any = {};
            headers.forEach((h, index) => row[h] = values[index]?.trim());
            data.push(row);
          }
        }
      }

      // Simulate progress
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 50 } : f));

      await apiRequest("POST", "/api/datasets", {
        name: file.name,
        projectId: id,
        fileName: file.name,
        fileSize: file.size,
        rowCount: data.length,
        columns,
        data
      });

      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 100, status: "complete" } : f));
    } catch (error) {
      console.error("Upload failed", error);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "error", progress: 0 } : f));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(handleUpload);
  }, [id]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(handleUpload);
    e.target.value = "";
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <ClientLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <Link href={`/client/projects/${id}`}>
          <button
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            data-testid="button-back-project"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </button>
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Upload Datasets</h1>
          <p className="text-muted-foreground">
            Upload your data files for analysts to work with
          </p>
        </div>

        <Card className="border-card-border bg-card mb-6">
          <CardContent className="p-6">
            <div
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
                }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                multiple
                accept=".csv,.xlsx,.xls,.json,.txt,.parquet"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                data-testid="input-file-upload"
              />
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Drop files here or click to upload
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports CSV, Excel, JSON, and Parquet files up to 50MB
                </p>
                <Button variant="outline" data-testid="button-browse-files">
                  Browse Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Uploaded Files</h2>
              <span className="text-sm text-muted-foreground">
                {files.filter(f => f.status === "complete").length} of {files.length} complete
              </span>
            </div>
            <div className="space-y-3">
              {files.map((file) => (
                <UploadedFileCard
                  key={file.id}
                  file={file}
                  onRemove={() => handleRemoveFile(file.id)}
                />
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Link href={`/client/projects/${id}`}>
                <Button variant="outline" data-testid="button-done-upload">
                  Done
                </Button>
              </Link>
            </div>
          </div>
        )}

        <Card className="border-card-border bg-card mt-6">
          <CardHeader>
            <CardTitle className="text-base">Data Security</CardTitle>
            <CardDescription>
              Your data is protected with enterprise-grade security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                Files are encrypted at rest and in transit
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                Only assigned analysts can access your data
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                Complete audit logging of all data access
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                Data is automatically deleted after project completion
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
