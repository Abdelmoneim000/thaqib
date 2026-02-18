import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreateDashboardDialog } from "@/components/bi/create-dashboard-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  LayoutDashboard,
  BarChart3,
  Search,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Loader2,
  Star,
  StarOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Dashboard } from "@shared/schema";

export default function DashboardsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: dashboards, isLoading: isLoadingDashboards } = useQuery<Dashboard[]>({
    queryKey: ["/api/dashboards"],
  });

  const { data: visualizations, isLoading: isLoadingVisualizations } = useQuery<any[]>({
    queryKey: ["/api/visualizations"],
  });



  const updateDashboardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Dashboard> }) => {
      const res = await apiRequest("PATCH", `/api/dashboards/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({ title: "Dashboard updated", description: "Changes saved successfully." });
    },
    onError: () => {
      toast({ title: "Failed to update dashboard", variant: "destructive" });
    }
  });

  const toggleShowcase = (dashboard: Dashboard) => {
    updateDashboardMutation.mutate({
      id: dashboard.id,
      data: { isShowcase: !dashboard.isShowcase }
    });
  };



  const filteredDashboards = dashboards?.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <AnalystLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboards & Visualizations</h1>
            <p className="text-muted-foreground">
              Create and manage your data visualizations
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/analyst/visualization-builder">
              <Button variant="outline" data-testid="button-new-viz">
                <BarChart3 className="h-4 w-4 mr-2" />
                New Visualization
              </Button>
            </Link>
            <CreateDashboardDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              trigger={
                <Button data-testid="button-new-dashboard">
                  <Plus className="h-4 w-4 mr-2" />
                  New Dashboard
                </Button>
              }
            />
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-dashboards"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Dashboards</h2>
            {isLoadingDashboards ? (
              <div className="bg-card border rounded-lg p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : filteredDashboards.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Dashboards Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first dashboard to get started
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDashboards.map((dashboard) => (
                  <Link key={dashboard.id} href={`/analyst/dashboard/${dashboard.id}`}>
                    <Card
                      className="hover-elevate cursor-pointer h-full"
                      data-testid={`card-dashboard-${dashboard.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{dashboard.name}</CardTitle>
                            {/* Project name would need enrichment or fetch */}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.preventDefault();
                                toggleShowcase(dashboard);
                              }}>
                                {dashboard.isShowcase ? (
                                  <>
                                    <StarOff className="h-4 w-4 mr-2" />
                                    Remove from Showcase
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Add to Showcase
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {dashboard.description && (
                          <CardDescription className="text-sm line-clamp-2">
                            {dashboard.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="flex flex-col pt-0">
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BarChart3 className="h-4 w-4" />
                            {/* Layout items count */}
                            {(dashboard as any).visualizationsCount || 0} charts
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={dashboard.isPublished ? "default" : "secondary"}>
                              {dashboard.isPublished ? "Published" : "Draft"}
                            </Badge>
                            {dashboard.isShowcase && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">
                                <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                                Showcase
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3" />
                          {dashboard.updatedAt ? new Date(dashboard.updatedAt).toLocaleDateString() : 'Unknown'}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Saved Visualizations</h2>
            {isLoadingVisualizations ? (
              <div className="bg-card border rounded-lg p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (!visualizations || visualizations.length === 0) ? (
              <div className="text-muted-foreground text-sm italic">No saved visualizations found. create one from the builder.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {visualizations.map((viz) => (
                  <Card
                    key={viz.id}
                    className="hover-elevate cursor-pointer"
                    data-testid={`card-viz-${viz.id}`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium truncate" title={viz.name}>{viz.name}</p>
                          <p className="text-sm text-muted-foreground truncate" title={viz.dashboardName}>
                            {viz.dashboardName || 'No Dashboard'}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize shrink-0">
                          {viz.chartType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                        <Clock className="h-3 w-3" />
                        {viz.createdAt ? new Date(viz.createdAt).toLocaleDateString() : ''}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnalystLayout >
  );
}
