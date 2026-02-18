import { useParams, Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Building2,
  FileSpreadsheet,
  BarChart3,
  MessageSquare,
  Loader2,
  Send,
  CheckCircle2,
  Plus,
  Eye,
  MoreVertical,
  Layout
} from "lucide-react";
import { ProjectChat } from "@/components/chat/project-chat";
import type { Project, Dataset, Dashboard } from "@shared/schema";
import { CreateDashboardDialog } from "@/components/bi/create-dashboard-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface EnrichedProject extends Project {
  clientName: string;
  datasetsCount: number;
  datasets?: Dataset[];
  dashboardsCount: number;
}

export default function AnalystProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: project, isLoading } = useQuery<EnrichedProject>({
    queryKey: ["/api/projects", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Project not found");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: dashboards } = useQuery<Dashboard[]>({
    queryKey: [`/api/dashboards?projectId=${id}`],
    enabled: !!id,
  });

  const submitDashboardMutation = useMutation({
    mutationFn: async (dashboardId: string) => {
      const res = await apiRequest("PATCH", `/api/dashboards/${dashboardId}`, {
        status: "submitted",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboards?projectId=${id}`] });
      toast({ title: "Dashboard submitted", description: "The dashboard has been submitted for client review." });
    },
    onError: () => {
      toast({ title: "Submission failed", description: "Could not submit dashboard.", variant: "destructive" });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="default">In Progress</Badge>;
      case "review":
        return <Badge variant="secondary">Review</Badge>;
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "open":
        return <Badge variant="outline">Open</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AnalystLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AnalystLayout>
    );
  }

  if (!project) {
    return (
      <AnalystLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium mb-2">Project not found</h3>
              <Link href="/analyst/projects">
                <Button variant="outline">Back to Projects</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AnalystLayout>
    );
  }

  return (
    <AnalystLayout>
      <div className="p-6 space-y-6">
        <div>
          <Link href="/analyst/projects">
            <button
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
              data-testid="button-back-projects"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </button>
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
                {getStatusBadge(project.status)}
              </div>
              {project.description && (
                <p className="text-muted-foreground max-w-2xl">{project.description}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {project.budget && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                <span>${project.budget.toLocaleString()} budget</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              <span>Client: {project.clientName}</span>
            </div>
            {project.createdAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Started {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="chat" data-testid="tab-chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with Client
            </TabsTrigger>
            <TabsTrigger value="datasets" data-testid="tab-datasets">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Datasets ({project.datasetsCount || 0})
            </TabsTrigger>
            <TabsTrigger value="dashboards" data-testid="tab-dashboards">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboards ({project.dashboardsCount || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="h-[500px]">
            <ProjectChat
              projectId={project.id}
              currentUserId={user?.id || ""}
              currentUserRole={(user?.role as "client" | "analyst" | "admin") || "analyst"}
            />
          </TabsContent>

          <TabsContent value="datasets">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Datasets</CardTitle>
              </CardHeader>
              <CardContent>
                {project.datasets && project.datasets.length > 0 ? (
                  <div className="space-y-4">
                    {project.datasets.map((dataset) => (
                      <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{dataset.name}</p>
                            <p className="text-xs text-muted-foreground">{dataset.fileName} • {dataset.rowCount ? `${dataset.rowCount.toLocaleString()} rows` : 'Unknown size'}</p>
                          </div>
                        </div>
                        {dataset.createdAt && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(dataset.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <FileSpreadsheet className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-sm">No datasets available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboards">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Project Dashboards</CardTitle>
                {project.status !== "completed" && (
                  <CreateDashboardDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    projectId={id}
                    trigger={
                      <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Dashboard
                      </Button>
                    }
                  />
                )}
              </CardHeader>
              <CardContent>
                {dashboards && dashboards.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dashboards.map((dashboard) => (
                      <Card key={dashboard.id} className="flex flex-col">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base truncate" title={dashboard.name}>
                              {dashboard.name}
                            </CardTitle>
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
                            <p className="text-sm text-muted-foreground line-clamp-2">{dashboard.description}</p>
                          )}
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-end pt-0">
                          <div className="flex items-center gap-2 mt-4">
                            <Link href={`/analyst/dashboard/${dashboard.id}`} className="flex-1">
                              <Button variant="outline" className="w-full" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View & Edit
                              </Button>
                            </Link>
                            {(dashboard.status === "draft" || dashboard.status === "rejected") && project.status !== "completed" && (
                              <Button
                                size="sm"
                                onClick={() => submitDashboardMutation.mutate(dashboard.id)}
                                disabled={submitDashboardMutation.isPending}
                                title="Submit for Review"
                              >
                                {submitDashboardMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <BarChart3 className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-sm">Dashboards created: {project.dashboardsCount}</p>
                    {project.status !== "completed" && (
                      <Link href="/analyst/visualization-builder">
                        <Button className="mt-4" size="sm" data-testid="button-create-visualization">
                          Create Visualization
                        </Button>
                      </Link>
                    )}
                  </div>)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AnalystLayout>
  );
}
