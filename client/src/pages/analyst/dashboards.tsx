import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Loader2
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
  const [newDashboardName, setNewDashboardName] = useState("");
  const [newDashboardDesc, setNewDashboardDesc] = useState("");

  const { data: dashboards, isLoading: isLoadingDashboards } = useQuery<Dashboard[]>({
    queryKey: ["/api/dashboards"],
  });

  const { data: visualizations, isLoading: isLoadingVisualizations } = useQuery<any[]>({
    queryKey: ["/api/visualizations"],
  });

  const createDashboardMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await apiRequest("POST", "/api/dashboards", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({ title: "Dashboard created", description: "Start adding visualizations now." });
      setIsCreateDialogOpen(false);
      setNewDashboardName("");
      setNewDashboardDesc("");
    },
    onError: () => {
      toast({ title: "Failed to create dashboard", variant: "destructive" });
    }
  });

  const handleCreateDashboard = () => {
    if (!newDashboardName) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    createDashboardMutation.mutate({
      name: newDashboardName,
      description: newDashboardDesc,
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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-dashboard">
                  <Plus className="h-4 w-4 mr-2" />
                  New Dashboard
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Dashboard</DialogTitle>
                  <DialogDescription>
                    Create a blank dashboard to add visualizations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Dashboard Name</Label>
                    <Input
                      id="name"
                      value={newDashboardName}
                      onChange={(e) => setNewDashboardName(e.target.value)}
                      placeholder="e.g., Q1 Sales Report"
                      data-testid="input-new-dashboard-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description (optional)</Label>
                    <Textarea
                      id="desc"
                      value={newDashboardDesc}
                      onChange={(e) => setNewDashboardDesc(e.target.value)}
                      placeholder="Brief description of the dashboard"
                      data-testid="textarea-new-dashboard-desc"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDashboard} disabled={createDashboardMutation.isPending} data-testid="button-create-dashboard">
                    {createDashboardMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Dashboard
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {dashboard.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {dashboard.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BarChart3 className="h-4 w-4" />
                            {/* Layout items count */}
                            {dashboard.layout?.items?.length || 0} charts
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={dashboard.isPublished ? "default" : "secondary"}>
                              {dashboard.isPublished ? "Published" : "Draft"}
                            </Badge>
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
    </AnalystLayout>
  );
}
