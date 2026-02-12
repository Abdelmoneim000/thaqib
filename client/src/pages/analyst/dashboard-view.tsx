import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Calendar, LayoutDashboard } from "lucide-react";
import { ChartRenderer } from "@/components/bi/chart-renderer";
import type { Dashboard, Visualization, VisualizationConfig } from "@shared/schema";
import type { ChartType, ChartColors, ChartFormatting } from "@/lib/bi-types";

// Wrapper component to handle data fetching for a single visualization
function DashboardChart({ viz }: { viz: Visualization }) {
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
        enabled: !!viz.datasetId,
    });

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
    const config = (viz.config as unknown) as VisualizationConfig;

    return (
        <Card className="h-full flex flex-col min-h-[350px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{viz.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <div className="h-[300px] w-full">
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
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export default function DashboardViewPage() {
    const { id } = useParams<{ id: string }>();

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

    const isLoading = isDashboardLoading || isVizLoading;

    if (isLoading) {
        return (
            <AnalystLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AnalystLayout>
        );
    }

    if (!dashboard) {
        return (
            <AnalystLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">Dashboard not found</h2>
                    <Button asChild className="mt-4" variant="outline">
                        <Link href="/analyst/dashboards">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboards
                        </Link>
                    </Button>
                </div>
            </AnalystLayout>
        );
    }

    // If layout exists, use it to order/grid items. Otherwise just grid them.
    // Current implementation: Just a simple grid of all visualizations.
    // Future: Use dashboard.layout to position items.

    return (
        <AnalystLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href="/analyst/dashboards">
                                <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-semibold tracking-tight">{dashboard.name}</h1>
                            <Badge variant={dashboard.isPublished ? "default" : "secondary"}>
                                {dashboard.isPublished ? "Published" : "Draft"}
                            </Badge>
                        </div>
                        {dashboard.description && (
                            <p className="text-muted-foreground max-w-2xl pl-8">
                                {dashboard.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Updated {dashboard.updatedAt ? new Date(dashboard.updatedAt).toLocaleDateString() : 'Unknown'}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {visualizations?.map((viz) => (
                        <div key={viz.id} className="min-h-[350px]">
                            <DashboardChart viz={viz} />
                        </div>
                    ))}
                </div>

                {visualizations?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed">
                        <p className="text-muted-foreground mb-4">This dashboard has no visualizations yet.</p>
                        <Button asChild>
                            <Link href="/analyst/visualization-builder">
                                Create Visualization
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AnalystLayout>
    );
}
