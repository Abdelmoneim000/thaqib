import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import AnalystLayout from "@/components/analyst-layout";
import ClientLayout from "@/components/client-layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Loader2, Calendar, LayoutDashboard, Send, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { ChartRenderer } from "@/components/bi/chart-renderer";
import type { Dashboard, Visualization, VisualizationConfig } from "@shared/schema";
import type { ChartType, ChartColors, ChartFormatting } from "@/lib/bi-types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

// Wrapper component to handle data fetching for a single visualization
function DashboardChart({ viz, onDelete, onRename, readOnly }: { viz: Visualization; onDelete: (id: string) => void, onRename?: (id: string, newName: string) => Promise<void>, readOnly?: boolean }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(viz.name);
    const [isRenaming, setIsRenaming] = useState(false);

    // Extract text content for text charts
    let textContent: string | undefined;
    if (viz.chartType === "text" && viz.query) {
        try {
            const queryObj = typeof viz.query === 'string' ? JSON.parse(viz.query) : viz.query;
            if (queryObj && typeof queryObj === 'object' && 'type' in queryObj && (queryObj as any).type === "text") {
                textContent = (queryObj as any).text;
            }
        } catch (e) {
            console.error("Failed to parse text query", e);
        }
    }

    const { data: queryResult, isLoading, error } = useQuery<{ data: any[] }>({
        queryKey: ["/api/query", viz.datasetId, JSON.stringify(viz.query)],
        queryFn: async () => {
            if (!viz.datasetId) return { data: [] };
            const res = await fetch("/api/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ datasetId: viz.datasetId, query: viz.query }),
            });
            if (!res.ok) throw new Error("Failed to fetch data");
            return res.json();
        },
        enabled: !!viz.datasetId && viz.chartType !== "text",
    });

    const handleDelete = () => {
        setIsDeleting(true);
        onDelete(viz.id);
    };

    const handleRenameSubmit = async () => {
        if (!editName.trim() || editName === viz.name) {
            setIsEditing(false);
            setEditName(viz.name);
            return;
        }

        if (onRename) {
            setIsRenaming(true);
            try {
                await onRename(viz.id, editName);
                setIsEditing(false);
            } finally {
                setIsRenaming(false);
            }
        }
    };

    if (isLoading) {
        return (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
                <div className="text-center p-4">
                    <p className="text-destructive mb-2">Error loading data</p>
                    <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
                </div>
            </Card>
        );
    }

    // Cast config to correct type
    const config = (viz.config as unknown) as VisualizationConfig & { description?: string };

    if (config.description) {
        textContent = config.description;
    }

    return (
        <Card className="h-full flex flex-col min-h-[350px] relative group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 min-h-[60px]">
                {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit();
                                if (e.key === 'Escape') {
                                    setIsEditing(false);
                                    setEditName(viz.name);
                                }
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            autoFocus
                            disabled={isRenaming}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRenameSubmit}
                            disabled={isRenaming || !editName.trim()}
                        >
                            {isRenaming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                    </div>
                ) : (
                    <CardTitle className="text-base font-medium flex-1 flex items-center pr-4">
                        <span className="truncate">{viz.name}</span>
                        {!readOnly && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditing(true)}
                                className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
                            </Button>
                        )}
                    </CardTitle>
                )}
                {!readOnly && !isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive -mr-2">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Visualization?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove this visualization from the dashboard. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <div className="w-full">
                    <ChartRenderer
                        type={viz.chartType as ChartType}
                        data={queryResult?.data || []}
                        xAxis={config.xAxis}
                        yAxis={config.yAxis}
                        categoryField={config.categoryField}
                        valueField={config.valueField}
                        title={undefined}
                        colors={config.colors as ChartColors}
                        formatting={config.formatting as ChartFormatting}
                        textContent={textContent}
                    />
                </div>
            </CardContent>
        </Card>
    );
}


export default function AnalystDashboardViewPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [_, setLocation] = useLocation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isDeletingDashboard, setIsDeletingDashboard] = useState(false);

    // Parse query params for viewOnly
    const [isViewOnly, setIsViewOnly] = useState(false);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setIsViewOnly(params.get("viewOnly") === "true");
    }, []);

    const isClient = user?.role === "client";
    const Layout = isClient ? ClientLayout : AnalystLayout;

    // Fetch Dashboard Metadata
    const { data: dashboard, isLoading: isDashboardLoading } = useQuery<Dashboard>({
        queryKey: [`/api/dashboards/${id}`],
        enabled: !!id,
    });

    // Fetch Visualizations for this Dashboard
    const { data: visualizations, isLoading: isVizLoading } = useQuery<Visualization[]>({
        queryKey: [`/api/visualizations`, { dashboardId: id }],
        enabled: !!id,
    });

    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("PATCH", `/api/dashboards/${id}`, {
                status: "submitted",
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${id}`] });
            toast({ title: "Dashboard submitted", description: "The dashboard has been submitted for client review." });
        },
        onError: () => {
            toast({ title: "Submission failed", description: "Could not submit dashboard.", variant: "destructive" });
        }
    });

    const deleteVizMutation = useMutation({
        mutationFn: async (vizId: string) => {
            await apiRequest("DELETE", `/api/visualizations/${vizId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/visualizations`, { dashboardId: id }] });
            toast({ title: "Deleted", description: "Visualization removed." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete visualization", variant: "destructive" });
        }
    });

    const renameVizMutation = useMutation({
        mutationFn: async ({ vizId, newName }: { vizId: string; newName: string }) => {
            const res = await apiRequest("PATCH", `/api/visualizations/${vizId}`, { name: newName });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/visualizations`, { dashboardId: id }] });
            toast({ title: "Renamed", description: "Visualization name updated." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to rename visualization", variant: "destructive" });
        }
    });

    const deleteDashboardMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("DELETE", `/api/dashboards/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
            toast({ title: "Dashboard deleted", description: "The dashboard has been permanently removed." });
            setLocation(isClient ? "/client/find-analysts" : "/analyst/dashboards");
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete dashboard", variant: "destructive" });
        }
    });

    const handleShare = () => {
        // Placeholder for share logic
        toast({ title: "Share", description: "Share functionality not yet implemented." });
    };

    const isLoading = isDashboardLoading || isVizLoading;

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </Layout>
        );
    }

    if (!dashboard) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">Dashboard not found</h2>
                    <Button asChild className="mt-4" variant="outline">
                        <Link href={isClient ? "/client/projects" : "/analyst/dashboards"}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {isClient ? "Back to Projects" : "Back to Dashboards"}
                        </Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    // A dashboard is read-only if the user is a client OR if it has been submitted/approved.
    const readOnly = isViewOnly || isClient || dashboard.status === "submitted" || dashboard.status === "approved";
    // In case the dashboard hasn't loaded when computing readOnly earlier, re-compute
    const finalReadOnly = readOnly;

    return (
        <Layout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href={isClient ? (dashboard.projectId ? `/client/projects/${dashboard.projectId}` : "/client/projects") : "/analyst/dashboards"}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-semibold tracking-tight">{dashboard.name}</h1>
                            <Badge variant={
                                dashboard.status === "approved" ? "default" :
                                    dashboard.status === "submitted" ? "secondary" :
                                        "outline"
                            }>
                                {dashboard.status === "approved" ? "Approved" :
                                    dashboard.status === "submitted" ? "Under Review" :
                                        dashboard.status === "rejected" ? "Changes Requested" : "Draft"}
                            </Badge>
                        </div>
                        {dashboard.description && (
                            <p className="text-muted-foreground max-w-2xl pl-8">
                                {dashboard.description}
                            </p>
                        )}
                    </div>
                    {/* Removed Layout Controls */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {!finalReadOnly && (
                            <>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive" className="mr-2">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Dashboard
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the dashboard "{dashboard.name}" and all its visualizations.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    setIsDeletingDashboard(true);
                                                    deleteDashboardMutation.mutate();
                                                }}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                {isDeletingDashboard ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/analyst/visualization-builder?dashboardId=${dashboard.id}&projectId=${dashboard.projectId || ""}`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Visual
                                    </Link>
                                </Button>

                                {(dashboard.projectId && (dashboard.status === "draft" || dashboard.status === "rejected")) ? (
                                    <Button
                                        size="sm"
                                        onClick={() => submitMutation.mutate()}
                                        disabled={submitMutation.isPending}
                                    >
                                        {submitMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        Submit for Review
                                    </Button>
                                ) : dashboard.projectId ? (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                        <span className="font-medium">
                                            {dashboard.status === "submitted" ? "Submitted" : "Approved"}
                                        </span>
                                    </div>
                                ) : null}
                            </>
                        )}
                        {/* Always show the status badge if it is readOnly but belongs to a project */}
                        {finalReadOnly && !isClient && dashboard.projectId && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                    {dashboard.status === "submitted" ? "Submitted" : "Approved"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {visualizations?.map((viz) => (
                        <div key={viz.id} className="min-h-[350px]">
                            <DashboardChart
                                viz={viz}
                                onDelete={(id) => deleteVizMutation.mutate(id)}
                                onRename={async (id, newName) => {
                                    await renameVizMutation.mutateAsync({ vizId: id, newName });
                                }}
                                readOnly={finalReadOnly}
                            />
                        </div>
                    ))}
                </div>

                {visualizations?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
                        <p className="text-muted-foreground mb-4">This dashboard has no visualizations yet.</p>
                        {!finalReadOnly && (
                            <Button asChild>
                                <Link href={`/analyst/visualization-builder?dashboardId=${dashboard.id}&projectId=${dashboard.projectId || ""}`}>
                                    Create Visualization
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
