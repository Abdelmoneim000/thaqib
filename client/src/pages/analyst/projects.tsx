import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@shared/schema";
import {
  Calendar,
  DollarSign,
  Building2,
  Clock,
  FileSpreadsheet,
  BarChart3,
  Upload,
  MessageSquare,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface EnrichedProject extends Project {
  clientName: string;
  datasetsCount: number;
  dashboardsCount: number;
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

function ProjectCard({ project, showActions = true }: { project: EnrichedProject; showActions?: boolean }) {
  // Simple progress estimation based on status
  const progress = project.status === "completed" ? 100 : project.status === "review" ? 90 : 40;

  return (
    <Card data-testid={`card-project-${project.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {project.clientName}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(project.status)}
            <div className="text-lg font-bold">${(project.budget || 0).toLocaleString()}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Deadline</p>
              <p className="font-medium">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Datasets</p>
              <p className="font-medium">{project.datasetsCount} files</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Dashboards</p>
              <p className="font-medium">{project.dashboardsCount} created</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Last Activity</p>
              <p className="font-medium">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recently'}</p>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
            <Link href={`/analyst/projects/${project.id}`}>
              <Button variant="outline" size="sm" data-testid={`button-details-${project.id}`}>
                View Details
              </Button>
            </Link>

            {/* 
            <Link href={`/analyst/projects/${project.id}/chat`}>
              <Button variant="outline" size="sm" data-testid={`button-message-${project.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Client
              </Button>
            </Link>
            */}

            {project.status === "in_progress" && (
              <>
                {/* Upload Dashboard functionality would be implemented in project details page or separate modal */}
              </>
            )}
            {project.status === "review" && (
              <Button variant="secondary" size="sm" disabled>
                Awaiting Client Review
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalystProjectsPage() {
  const { data: projects, isLoading } = useQuery<EnrichedProject[]>({
    queryKey: ["/api/projects"],
  });

  const activeProjects = projects?.filter(p => ["in_progress", "review"].includes(p.status)) || [];
  const completedProjects = projects?.filter(p => p.status === "completed") || [];

  const inProgressProjects = activeProjects.filter(p => p.status === "in_progress");
  const underReviewProjects = activeProjects.filter(p => p.status === "review");

  if (isLoading) {
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
          <h1 className="text-2xl font-semibold tracking-tight">Active Projects</h1>
          <p className="text-muted-foreground">
            Manage your ongoing data analysis projects
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressProjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Under Review
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{underReviewProjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Completed
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedProjects.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active" data-testid="tab-active">
              Active ({activeProjects.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Completed ({completedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {activeProjects.length > 0 ? (
              activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active projects</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start by browsing available projects and applying
                  </p>
                  <Link href="/analyst/browse">
                    <Button data-testid="button-browse-projects">
                      Browse Projects
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedProjects.length > 0 ? (
              completedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} showActions={false} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No completed projects yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AnalystLayout>
  );
}
