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

// Wrapper component to handle data fetching for a single visualization
function DashboardChart({ viz, onDelete, readOnly }: { viz: Visualization; onDelete: (id: string) => void, readOnly?: boolean }) {
    const [isDeleting, setIsDeleting] = useState(false);

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
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-medium">{viz.name}</CardTitle>
                {!readOnly && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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


export default function DashboardViewPage() {
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
    const readOnly = isViewOnly || isClient;
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
                        <Link href={isClient ? "/client/find-analysts" : "/analyst/dashboards"}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {isClient ? "Back to Browse" : "Back to Dashboards"}
                        </Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href={isClient ? `/analyst/public/${dashboard.createdBy}` : "/analyst/dashboards"}>
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

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {!readOnly && (
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
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {visualizations?.map((viz) => (
                        <div key={viz.id} className="min-h-[350px]">
                            <DashboardChart viz={viz} onDelete={(id) => deleteVizMutation.mutate(id)} readOnly={readOnly} />
                        </div>
                    ))}
                </div>

                {visualizations?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
                        <p className="text-muted-foreground mb-4">This dashboard has no visualizations yet.</p>
                        {!readOnly && (
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
