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
import { useTranslation } from "react-i18next";

interface EnrichedProject extends Project {
  clientName: string;
  datasetsCount: number;
  datasets?: Dataset[];
  dashboardsCount: number;
}

export default function AnalystProjectDetailPage() {
  const { t } = useTranslation();
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
      toast({ title: t("analyst_project_detail.dashboard_submitted"), description: t("analyst_project_detail.dashboard_submitted_desc") });
    },
    onError: () => {
      toast({ title: t("analyst_project_detail.submission_failed"), description: t("analyst_project_detail.submission_failed_desc"), variant: "destructive" });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="default">{t("analyst_project_detail.in_progress")}</Badge>;
      case "review":
        return <Badge variant="secondary">{t("analyst_project_detail.review")}</Badge>;
      case "completed":
        return <Badge className="bg-green-600">{t("analyst_project_detail.completed")}</Badge>;
      case "open":
        return <Badge variant="outline">{t("analyst_project_detail.open")}</Badge>;
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
              <h3 className="text-lg font-medium mb-2">{t("analyst_project_detail.project_not_found")}</h3>
              <Link href="/analyst/projects">
                <Button variant="outline">{t("analyst_project_detail.back_to_projects")}</Button>
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
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("analyst_project_detail.back_to_projects")}
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
                <span>${project.budget.toLocaleString()} {t("analyst_project_detail.budget")}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              <span>{t("analyst_project_detail.client")} {project.clientName}</span>
            </div>
            {project.createdAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{t("analyst_project_detail.started")} {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="chat" data-testid="tab-chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t("analyst_project_detail.chat_with_client")}
            </TabsTrigger>
            <TabsTrigger value="datasets" data-testid="tab-datasets">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {t("analyst_project_detail.datasets")} ({project.datasetsCount || 0})
            </TabsTrigger>
            <TabsTrigger value="dashboards" data-testid="tab-dashboards">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t("analyst_project_detail.dashboards")} ({project.dashboardsCount || 0})
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
                <CardTitle className="text-base">{t("analyst_project_detail.project_datasets")}</CardTitle>
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
                            <p className="text-xs text-muted-foreground">{dataset.fileName} • {dataset.rowCount ? `${dataset.rowCount.toLocaleString()} ${t("analyst_project_detail.rows")}` : t("analyst_project_detail.unknown_size")}</p>
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
                    <p className="text-sm">{t("analyst_project_detail.no_datasets")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboards">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t("analyst_project_detail.project_dashboards")}</CardTitle>
                {project.status !== "completed" && (
                  <CreateDashboardDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    projectId={id}
                    trigger={
                      <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("analyst_project_detail.create_dashboard")}
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
                              {dashboard.status === "approved" ? t("project_detail.approved") :
                                dashboard.status === "submitted" ? t("project_detail.under_review") :
                                  dashboard.status === "rejected" ? t("project_detail.changes_requested") : t("project_detail.draft")}
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
                                {t("analyst_project_detail.view_edit")}
                              </Button>
                            </Link>
                            {(dashboard.status === "draft" || dashboard.status === "rejected") && project.status !== "completed" && (
                              <Button
                                size="sm"
                                onClick={() => submitDashboardMutation.mutate(dashboard.id)}
                                disabled={submitDashboardMutation.isPending}
                                title={t("analyst_project_detail.submit_for_review")}
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
                    <p className="text-sm">{t("analyst_project_detail.dashboards_created")} {project.dashboardsCount}</p>
                    {project.status !== "completed" && (
                      <Link href="/analyst/visualization-builder">
                        <Button className="mt-4" size="sm" data-testid="button-create-visualization">
                          {t("analyst_project_detail.create_visualization")}
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
