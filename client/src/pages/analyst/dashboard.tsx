import AnalystLayout from "@/components/analyst-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import type { Project, Application } from "@shared/schema";
import {
  Search,
  FileText,
  FolderKanban,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Star,
  Users
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface EnrichedProject extends Project {
  clientName: string;
}

interface AnalystStats {
  totalProjects: number;
  completedProjects: number;
  totalEarnings: number;
  averageRating: number;
  ratingsCount: number;
  totalClients: number;
}

function getStatusBadge(status: string) {
  const { t } = useTranslation();
  switch (status) {
    case "in_progress":
      return <Badge variant="default">{t("analyst_dashboard.in_progress")}</Badge>;
    case "review":
      return <Badge variant="secondary">{t("analyst_dashboard.under_review")}</Badge>;
    case "completed":
      return <Badge className="bg-green-600 hover:bg-green-700">{t("analyst_dashboard.completed")}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AnalystDashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Fetch analyst's projects
  const { data: myProjects, isLoading: isLoadingProjects } = useQuery<EnrichedProject[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch open projects (recommended)
  const { data: openProjects, isLoading: isLoadingOpenProjects } = useQuery<EnrichedProject[]>({
    queryKey: ["/api/projects?status=open"],
  });

  // Fetch applications
  const { data: applications, isLoading: isLoadingApps } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Fetch aggregated stats
  const { data: analystStats, isLoading: isLoadingStats } = useQuery<AnalystStats>({
    queryKey: ["/api/analyst/stats"],
  });

  const activeProjects = myProjects?.filter(p => p.status === "in_progress" || p.status === "review") || [];
  const completedProjects = myProjects?.filter(p => p.status === "completed") || [];
  const pendingApps = applications?.filter(a => a.status === "pending") || [];

  // Use stats from API or fallback to calculation
  const totalEarnings = analystStats?.totalEarnings ?? completedProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const avgRating = analystStats?.averageRating ?? 0;
  const ratingCount = analystStats?.ratingsCount ?? 0;

  // Recent projects to show (active ones first)
  const recentProjects = activeProjects.slice(0, 3);

  // Recommended projects (open ones)
  const recommendedProjects = openProjects?.slice(0, 2) || [];

  const stats = [
    {
      title: t("analyst_dashboard.active_projects"),
      value: activeProjects.length.toString(),
      description: t("analyst_dashboard.currently_working"),
      icon: FolderKanban,
      trend: myProjects ? `${myProjects.length} ${t("analyst_dashboard.total_assigned")}` : t("common.loading"),
    },
    {
      title: t("analyst_dashboard.total_earnings"),
      value: `$${totalEarnings.toLocaleString()}`,
      description: t("analyst_dashboard.from_completed"),
      icon: DollarSign,
      trend: `${analystStats?.completedProjects ?? completedProjects.length} ${t("analyst_dashboard.projects_completed")}`,
    },
    {
      title: t("analyst_dashboard.pending_apps"),
      value: pendingApps.length.toString(),
      description: t("analyst_dashboard.awaiting_response"),
      icon: FileText,
      trend: applications ? `${applications.length} ${t("analyst_dashboard.submitted_apps")}` : t("common.loading"),
    },
    {
      title: t("analyst_dashboard.overall_rating"),
      value: avgRating > 0 ? avgRating.toFixed(1) : "N/A",
      description: `${t("analyst_dashboard.based_on")} ${ratingCount} ${t("analyst_dashboard.reviews")}`,
      icon: Star,
      trend: "Based on client feedback",
    }
  ];

  if (isLoadingProjects || isLoadingOpenProjects || isLoadingApps) {
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("analyst_dashboard.welcome")}, {user?.firstName || 'Analyst'}!</h1>
            <p className="text-muted-foreground mt-1">
              {t("analyst_dashboard.overview")}
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="md:col-span-2 border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("analyst_dashboard.active_projects")}</CardTitle>
                <CardDescription>{t("analyst_dashboard.currently_working")}</CardDescription>
              </div>
              <Link href="/analyst/projects">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="link-view-all-projects">
                  {t("analyst_dashboard.view_all")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground font-medium">{t("analyst_dashboard.no_active")}</p>
                    <Link href="/analyst/browse">
                      <Button variant="ghost" className="mt-2 text-primary">
                        {t("analyst_dashboard.browse_to_apply")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                      data-testid={`card-project-${project.id}`}
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.clientName || 'Client Project'}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                          </div>
                          <div className="text-sm font-medium">${(project.budget || 0).toLocaleString()}</div>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("analyst_dashboard.recommended")}</CardTitle>
                <CardDescription>{t("analyst_dashboard.recommended_desc")}</CardDescription>
              </div>
              <Link href="/analyst/browse">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="link-browse-all">
                  {t("analyst_dashboard.view_latest")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedProjects.length === 0 ? (
                  <div className="text-center py-6">
                    <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground text-sm">{t("analyst_dashboard.no_recommended")}</p>
                  </div>
                ) : (
                  recommendedProjects.map((project) => (
                    <div key={project.id} className="p-4 rounded-lg border bg-card hover:bg-accent/10 transition-colors flex flex-col items-start gap-4 shadow-sm group" data-testid={`card-recommended-${project.id}`}>
                      <div className="w-full flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                        </div>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{t("analyst_dashboard.open")}</Badge>
                      </div>
                      <div className="w-full flex justify-between items-center">
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            Data Analysis
                          </Badge>
                        </div>
                        <Link href={`/analyst/browse`}>
                          <Button size="sm" variant="outline" data-testid={`button-view-${project.id}`}>
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 p-4 bg-muted/30 border rounded-lg">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">{t("analyst_dashboard.quick_actions")}</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/analyst/browse">
              <Button size="sm" className="gap-2" data-testid="button-find-projects">
                <Search className="h-4 w-4" />
                {t("analyst_dashboard.browse_new")}
              </Button>
            </Link>
            <Link href="/analyst/projects">
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-active-projects">
                <FolderKanban className="h-4 w-4" />
                {t("analyst_dashboard.view_active")}
              </Button>
            </Link>
            <Link href="/analyst/applications">
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-view-applications">
                <FileText className="h-4 w-4" />
                {t("analyst_dashboard.manage_applications")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AnalystLayout>
  );
}
