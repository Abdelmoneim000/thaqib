import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ClientLayout from "@/components/client-layout";
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
import { useTranslation } from "react-i18next";

interface EnrichedDataset extends Dataset {
    projectTitle: string;
    uploadedByName: string;
}

export default function ClientDatasetsPage() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    // Fetch Datasets
    const { data: datasets, isLoading } = useQuery<EnrichedDataset[]>({
        queryKey: ["/api/datasets"],
    });

    // Fetch Projects for Upload Dropdown
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
            toast({ title: t("datasets.dataset_deleted"), description: t("datasets.dataset_deleted_desc") });
            setDatasetToDelete(null);
        },
        onError: () => {
            toast({ title: t("datasets.delete_failed"), description: t("datasets.delete_failed_desc"), variant: "destructive" });
        }
    });

    const uploadMutation = useMutation({
        mutationFn: async ({ files, projectId }: { files: File[], projectId: string }) => {
            const results = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("projectId", projectId);

                const res = await fetch("/api/datasets", {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || `Failed to upload dataset: ${file.name}`);
                }
                results.push(await res.json());
            }
            return results;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
            // Also invalidate project-specific queries if possible, but global is enough for this page
            toast({ title: t("datasets.dataset_uploaded"), description: t("datasets.dataset_uploaded_desc") });
            setIsUploadOpen(false);
            setSelectedProjectId("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: (error: Error) => {
            toast({ title: t("datasets.upload_failed"), description: error.message, variant: "destructive" });
        }
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId) {
            toast({ title: t("datasets.project_required"), description: t("datasets.project_required_desc"), variant: "destructive" });
            return;
        }
        const files = fileInputRef.current?.files;
        if (!files || files.length === 0) {
            toast({ title: t("datasets.file_required"), description: t("datasets.file_required_multiple_desc"), variant: "destructive" });
            return;
        }

        uploadMutation.mutate({ files: Array.from(files), projectId: selectedProjectId });
    };

    const filteredDatasets = datasets?.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <ClientLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{t("client_datasets.title")}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t("client_datasets.manage_desc")}
                        </p>
                    </div>

                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t("client_datasets.upload")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("client_datasets.upload")}</DialogTitle>
                                <DialogDescription>
                                    {t("client_datasets.upload_desc")}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpload} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>{t("client_datasets.project")}</Label>
                                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("client_datasets.select_project")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects?.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("client_datasets.csv_file")}</Label>
                                    <Input
                                        type="file"
                                        accept=".csv"
                                        multiple
                                        ref={fileInputRef}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t("client_datasets.supported_formats")}
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>{t("common.cancel")}</Button>
                                    <Button type="submit" disabled={uploadMutation.isPending}>
                                        {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t("common.submit")}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{t("client_datasets.all_datasets")}</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t("client_datasets.search_placeholder")}
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
                                        <TableHead>{t("common.name")}</TableHead>
                                        <TableHead>{t("client_datasets.project")}</TableHead>
                                        <TableHead>{t("client_datasets.rows")}</TableHead>
                                        <TableHead>{t("client_datasets.size")}</TableHead>
                                        <TableHead>{t("client_datasets.uploaded")}</TableHead>
                                        <TableHead className="text-right">{t("common.actions")}</TableHead>
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
                                            <TableCell>{dataset.projectTitle}</TableCell>
                                            <TableCell>{dataset.rowCount?.toLocaleString()}</TableCell>
                                            <TableCell>{(dataset.fileSize ? (dataset.fileSize / 1024).toFixed(1) + ' KB' : '-')}</TableCell>
                                            <TableCell>{dataset.createdAt ? new Date(dataset.createdAt).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">{t("analyst_applications.open_menu", { defaultValue: "Open menu" })}</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await fetch(`/api/datasets/${dataset.id}/download-link`);
                                                                    if (!res.ok) throw new Error("Failed to get download link");
                                                                    const { downloadUrl } = await res.json();
                                                                    window.open(downloadUrl, '_blank');
                                                                } catch (err) {
                                                                    toast({
                                                                        title: t("datasets.download_failed"),
                                                                        description: t("datasets.download_failed_desc"),
                                                                        variant: "destructive"
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            {t("client_datasets.download")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive cursor-pointer"
                                                            onClick={() => {
                                                                setDatasetToDelete(dataset.id);
                                                                setIsDeleteOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            {t("client_datasets.delete")}
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

                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("client_datasets.delete")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("client_datasets.delete_confirm")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("client_datasets.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => datasetToDelete && deleteMutation.mutate(datasetToDelete)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t("client_datasets.confirm")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </ClientLayout >
    );
}
