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
  Loader2
} from "lucide-react";

interface EnrichedProject extends Project {
  clientName: string;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "in_progress":
      return <Badge variant="default">In Progress</Badge>;
    case "review":
      return <Badge variant="secondary">Under Review</Badge>;
    case "completed":
      return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AnalystDashboardPage() {
  const { user } = useAuth();

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

  const activeProjects = myProjects?.filter(p => p.status === "in_progress" || p.status === "review") || [];
  const completedProjects = myProjects?.filter(p => p.status === "completed") || [];
  const pendingApps = applications?.filter(a => a.status === "pending") || [];

  const totalEarnings = completedProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

  // Recent projects to show (active ones first)
  const recentProjects = activeProjects.slice(0, 3);

  // Recommended projects (open ones)
  const recommendedProjects = openProjects?.slice(0, 2) || [];

  const stats = [
    {
      title: "Active Projects",
      value: activeProjects.length.toString(),
      description: "Currently working on",
      icon: FolderKanban,
      trend: myProjects ? `${myProjects.length} total assigned` : "Loading...",
    },
    {
      title: "Pending Applications",
      value: pendingApps.length.toString(),
      description: "Awaiting response",
      icon: FileText,
      trend: applications ? `${applications.length} total applied` : "Loading...",
    },
    {
      title: "Earnings (Completed)",
      value: `$${totalEarnings.toLocaleString()}`,
      description: "From completed projects",
      icon: DollarSign,
      trend: `${completedProjects.length} projects completed`,
    },
    {
      title: "Completion Rate",
      value: "100%", // Hardcoded for now, or calculate if we had cancelled projects
      description: "On-time delivery",
      icon: TrendingUp,
      trend: "Excellent rating",
    },
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.firstName || 'Analyst'}</h1>
          <p className="text-muted-foreground">
            Here's an overview of your analyst activity
          </p>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Projects you're currently working on</CardDescription>
              </div>
              <Link href="/analyst/projects">
                <Button variant="ghost" size="sm" data-testid="link-view-all-projects">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No active projects. Apply to new projects to get started!
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
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Projects matching your skills</CardDescription>
              </div>
              <Link href="/analyst/browse">
                <Button variant="ghost" size="sm" data-testid="link-browse-all">
                  Browse All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedProjects.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No open projects available at the moment.
                  </div>
                ) : (
                  recommendedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-3 rounded-md border space-y-3"
                      data-testid={`card-recommended-${project.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {project.clientName || 'Client Project'}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {project.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${(project.budget || 0).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
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

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/analyst/browse">
                <Button data-testid="button-find-projects">
                  <Search className="mr-2 h-4 w-4" />
                  Find New Projects
                </Button>
              </Link>
              <Link href="/analyst/applications">
                <Button variant="outline" data-testid="button-view-applications">
                  <FileText className="mr-2 h-4 w-4" />
                  View Applications
                </Button>
              </Link>
              <Link href="/analyst/projects">
                <Button variant="outline" data-testid="button-active-projects">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Active Projects
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnalystLayout>
  );
}
