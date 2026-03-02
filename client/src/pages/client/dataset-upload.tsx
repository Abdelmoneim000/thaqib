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
  File,
  Copy
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Dataset } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "pending" | "uploading" | "complete" | "error";
  progress: number;
  fileObject?: File; // Store the actual file object for upload
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
  onRemove,
  onUpload
}: {
  file: UploadedFile;
  onRemove: () => void;
  onUpload: () => void;
}) {
  const { t } = useTranslation();
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

              {file.status === "pending" && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  {t("datasets.ready_to_upload")}
                </span>
              )}
              {file.status === "complete" && (
                <span className="flex items-center gap-1 text-sm text-chart-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("datasets.uploaded")}
                </span>
              )}
              {file.status === "error" && (
                <span className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {t("datasets.failed")}
                </span>
              )}
            </div>
            {file.status === "uploading" && (
              <Progress value={file.progress} className="mt-2 h-1.5" />
            )}
          </div>
        </div>
      </CardContent>
    </Card >
  );
}

export default function DatasetUploadPage() {
  const { id } = useParams<{ id: string }>();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: existingDatasets } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"], // Fetch all user datasets
  });

  const importMutation = useMutation({
    mutationFn: async (datasetId: string) => {
      const res = await apiRequest("POST", "/api/datasets/clone", {
        datasetId,
        projectId: id
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Dataset imported", description: "The dataset has been added to this project." });
      queryClient.invalidateQueries({ queryKey: [`/api/datasets`, { projectId: id }] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
    },
    onError: () => {
      toast({ title: "Import failed", description: "Could not import the dataset.", variant: "destructive" });
    }
  });

  const handleImport = (datasetId: string) => {
    importMutation.mutate(datasetId);
  };

  const handleUpload = async (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
      progress: 0,
      fileObject: file,
    };

    setFiles(prev => [...prev, newFile]);
  };

  const startUpload = async (fileId: string) => {
    const fileEntry = files.find(f => f.id === fileId);
    if (!fileEntry || !fileEntry.fileObject) return;

    const file = fileEntry.fileObject;

    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "uploading", progress: 0 } : f));

    let progressInterval: NodeJS.Timeout | undefined;

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === fileId && f.status === "uploading" && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        }));
      }, 200);
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

      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", id!);
      formData.append("name", file.name);

      await apiRequest("POST", "/api/datasets", formData);

      clearInterval(progressInterval);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 100, status: "complete" } : f));
      toast({ title: "Upload complete", description: `${file.name} uploaded successfully.` });
    } catch (error) {
      console.error("Upload failed", error);
      clearInterval(progressInterval);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "error", progress: 0 } : f));
      toast({ title: "Upload failed", description: "Could not upload file.", variant: "destructive" });
    }
  };

  const startAllUploads = () => {
    files.filter(f => f.status === "pending").forEach(f => startUpload(f.id));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.map(file => handleUpload(file));
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
    selectedFiles.map(file => handleUpload(file));
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
            {t("datasets.back_to_project")}
          </button>
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">{t("datasets.upload_title")}</h1>
          <p className="text-muted-foreground">
            {t("datasets.upload_subtitle")}
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload">{t("datasets.upload_new")}</TabsTrigger>
            <TabsTrigger value="library">{t("datasets.import_library")}</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
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
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".csv,.xlsx,.xls,.json,.txt,.parquet"
                    onChange={handleFileSelect}
                    className="hidden" // Hidden input, triggered by label/button
                    data-testid="input-file-upload"
                  />
                  <div className="flex flex-col items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {t("datasets.drop_files")}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("datasets.supports_formats")}
                    </p>
                    <label htmlFor="file-upload">
                      <Button variant="outline" data-testid="button-browse-files" asChild>
                        <span>{t("datasets.browse_files")}</span>
                      </Button>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">{t("datasets.uploaded_files")}</h2>
                  <span className="text-sm text-muted-foreground">
                    {files.filter(f => f.status === "complete").length} {t("common.of")} {files.length} {t("datasets.complete")}
                  </span>
                </div>
                <div className="space-y-3">
                  {files.map((file) => (
                    <UploadedFileCard
                      key={file.id}
                      file={file}

                      onRemove={() => handleRemoveFile(file.id)}
                      onUpload={() => startUpload(file.id)}
                    />
                  ))}
                </div>
                {files.some(f => f.status === "pending") && (
                  <div className="flex justify-end pt-2">
                    <Button onClick={startAllUploads}>{t("datasets.upload_all_pending")}</Button>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <Link href={`/client/projects/${id}`}>
                    <Button variant="outline" data-testid="button-done-upload">
                      {t("datasets.done")}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="library">
            <Card className="border-card-border bg-card">
              <CardHeader>
                <CardTitle>{t("datasets.your_library")}</CardTitle>
                <CardDescription>{t("datasets.reuse_desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {existingDatasets && existingDatasets.length > 0 ? (
                    existingDatasets.map((dataset) => (
                      <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                            <FileSpreadsheet className="h-5 w-5 text-chart-2" />
                          </div>
                          <div>
                            <p className="font-medium">{dataset.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {dataset.rowCount?.toLocaleString()} {t("datasets.rows")} • {formatFileSize(dataset.fileSize || 0)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleImport(dataset.id)}
                          disabled={importMutation.isPending}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {t("datasets.import")}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("datasets.no_existing")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="border-card-border bg-card mt-6">
          <CardHeader>
            <CardTitle className="text-base">{t("datasets.data_security")}</CardTitle>
            <CardDescription>
              {t("datasets.security_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                {t("datasets.encrypted")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                {t("datasets.assigned_only")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                {t("datasets.audit_logging")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                {t("datasets.auto_deleted")}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
