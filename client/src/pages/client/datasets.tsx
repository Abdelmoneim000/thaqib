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
            toast({ title: "Dataset deleted", description: "The dataset has been permanently removed." });
            setDatasetToDelete(null);
        },
        onError: () => {
            toast({ title: "Delete failed", description: "Could not delete the dataset.", variant: "destructive" });
        }
    });

    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            // Need to send to /api/datasets
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
            // Also invalidate project-specific queries if possible, but global is enough for this page
            toast({ title: "Dataset uploaded", description: "Your dataset has been processed successfully." });
            setIsUploadOpen(false);
            setSelectedProjectId("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: (error: Error) => {
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        }
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId) {
            toast({ title: "Project required", description: "Please select a project", variant: "destructive" });
            return;
        }
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            toast({ title: "File required", description: "Please select a CSV file", variant: "destructive" });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", selectedProjectId);

        uploadMutation.mutate(formData);
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
                        <h1 className="text-2xl font-semibold tracking-tight">Datasets</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your data files across all projects
                        </p>
                    </div>

                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Upload Dataset
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload Dataset</DialogTitle>
                                <DialogDescription>
                                    Upload a CSV file to a specific project.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpload} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Project</Label>
                                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a project" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                    <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={uploadMutation.isPending}>
                                        {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Upload
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Datasets</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search datasets..."
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
                                <p>No datasets found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Rows</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
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
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setDatasetToDelete(dataset.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
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

                <AlertDialog open={!!datasetToDelete} onOpenChange={(open) => !open && setDatasetToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the dataset and remove it from all projects. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => datasetToDelete && deleteMutation.mutate(datasetToDelete)}
                            >
                                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </ClientLayout >
    );
}
