
import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, FileSpreadsheet, Download, Trash2, Search, MoreHorizontal } from "lucide-react";
import type { Dataset, Project } from "@shared/schema";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnrichedDataset extends Dataset {
    projectTitle: string;
    uploadedByName: string;
}

import { useTranslation } from "react-i18next";

export default function AnalystDatasetsPage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("personal");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Datasets (Analyst view logic handles permissions)
    const { data: datasets, isLoading } = useQuery<EnrichedDataset[]>({
        queryKey: ["/api/datasets"],
    });

    // Fetch Projects for Upload Dropdown (Ideally filter by assigned only, but API returns all? If so, we might list all open projects)
    // Assuming analyst can only upload to assigned projects or personal. 
    // If /api/projects return all, we might want to filter, but let's stick to simple for now.
    const { data: projects } = useQuery<Project[]>({
        queryKey: ["/api/projects"],
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/datasets/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
            toast({ title: "Dataset deleted", description: "The dataset has been permanently removed." });
            setDatasetToDelete(null);
        },
        onError: () => {
            toast({ title: "Delete failed", description: "Could not delete the dataset.", variant: "destructive" });
        }
    });

    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch("/api/datasets", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to upload dataset");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
            toast({ title: "Dataset uploaded", description: "Your dataset has been processed successfully." });
            setIsUploadOpen(false);
            setSelectedProjectId("personal");
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: (error: Error) => {
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        }
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            toast({ title: "File required", description: "Please select a CSV file", variant: "destructive" });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        if (selectedProjectId && selectedProjectId !== "personal") {
            formData.append("projectId", selectedProjectId);
        }

        uploadMutation.mutate(formData);
    };

    const filteredDatasets = datasets?.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <AnalystLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AnalystLayout>
        );
    }

    return (
        <AnalystLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{t("analyst_management.datasets_title")}</h1>
                        <p className="text-muted-foreground">
                            {t("analyst_management.datasets_desc")}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2" data-testid="button-upload-dataset">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t("analyst_management.upload_dataset")}
                                </Button>
                            </DialogTrigger>
                            <DialogContent data-testid="dialog-upload-dataset">
                                <DialogHeader>
                                    <DialogTitle>{t("analyst_management.upload_new")}</DialogTitle>
                                    <DialogDescription>
                                        {t("dataset_upload.supported")}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpload} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Target Location</Label>
                                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select target" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="personal">Personal Library (Private)</SelectItem>
                                                {projects?.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CSV File</Label>
                                        <Input
                                            type="file"
                                            accept=".csv"
                                            ref={fileInputRef}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Supported formats: .csv (Max 50MB)
                                        </p>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                                            {t("common.cancel")}
                                        </Button>
                                        <Button type="submit" disabled={uploadMutation.isPending} data-testid="button-submit-upload">
                                            {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {t("analyst_management.upload_dataset")}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{t("client_datasets.my_datasets")}</CardTitle>
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t("analyst_management.search_datasets")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredDatasets.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                <p>{t("client_datasets.no_datasets")}</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("analyst_management.name")}</TableHead>
                                        <TableHead>{t("analyst_management.project")}</TableHead>
                                        <TableHead>{t("analyst_management.size")}</TableHead>
                                        <TableHead className="hidden md:table-cell">{t("analyst_management.uploaded_by")}</TableHead>
                                        <TableHead className="hidden lg:table-cell">{t("analyst_management.uploaded_date")}</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDatasets.map((dataset) => (
                                        <TableRow key={dataset.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                                                    {dataset.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {dataset.projectTitle === 'Personal Library' ? (
                                                    <span className="text-muted-foreground italic">Personal Library</span>
                                                ) : (
                                                    dataset.projectTitle
                                                )}
                                            </TableCell>
                                            <TableCell>{(dataset.fileSize ? (dataset.fileSize / 1024).toFixed(1) + ' KB' : '-')}</TableCell>
                                            <TableCell>{dataset.uploadedByName || '-'}</TableCell>
                                            <TableCell className="hidden lg:table-cell">{dataset.createdAt ? new Date(dataset.createdAt).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>{t("analyst_applications.actions")}</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await fetch(`/api/datasets/${dataset.id}/download-link`);
                                                                    if (!res.ok) throw new Error("Failed to get download link");
                                                                    const { downloadUrl } = await res.json();
                                                                    window.open(downloadUrl, '_blank');
                                                                } catch (err) {
                                                                    toast({
                                                                        title: t("analyst_management.download_error"),
                                                                        description: t("analyst_management.download_error_desc"),
                                                                        variant: "destructive"
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            {t("dataset_upload.uploading")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="cursor-pointer text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                setDatasetToDelete(dataset.id);
                                                                setIsDeleteOpen(true);
                                                            }}
                                                            data-testid={`menu-delete-${dataset.id}`}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            {t("dataset_upload.delete")}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <AlertDialog open={isDeleteOpen} onOpenChange={(open) => {
                    setIsDeleteOpen(open);
                    if (!open) setDatasetToDelete(null);
                }}>
                    <AlertDialogContent data-testid="dialog-delete-dataset">
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("dataset_upload.delete_confirm")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("analyst_management.delete_confirm")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => datasetToDelete && deleteMutation.mutate(datasetToDelete)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                data-testid="button-confirm-delete"
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t("dataset_upload.delete")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AnalystLayout >
    );
}
