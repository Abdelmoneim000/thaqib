import { Link } from "wouter";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  DollarSign,
  Building2,
  Clock,
  FileSpreadsheet,
  BarChart3,
  Upload,
  MessageSquare,
  CheckCircle2
} from "lucide-react";

type ProjectStatus = "in_progress" | "review" | "completed";

interface ActiveProject {
  id: string;
  title: string;
  client: string;
  budget: number;
  status: ProjectStatus;
  deadline: string;
  startDate: string;
  progress: number;
  datasets: number;
  dashboards: number;
  lastActivity: string;
}

const activeProjects: ActiveProject[] = [
  {
    id: "proj1",
    title: "Sales Performance Dashboard",
    client: "TechCorp Inc.",
    budget: 2500,
    status: "in_progress",
    deadline: "Jan 25, 2026",
    startDate: "Jan 5, 2026",
    progress: 65,
    datasets: 3,
    dashboards: 1,
    lastActivity: "2 hours ago",
  },
  {
    id: "proj2",
    title: "Customer Churn Analysis",
    client: "RetailMax",
    budget: 1800,
    status: "in_progress",
    deadline: "Jan 30, 2026",
    startDate: "Jan 8, 2026",
    progress: 40,
    datasets: 2,
    dashboards: 0,
    lastActivity: "1 day ago",
  },
  {
    id: "proj3",
    title: "Marketing ROI Report",
    client: "GrowthLabs",
    budget: 1200,
    status: "review",
    deadline: "Jan 18, 2026",
    startDate: "Jan 2, 2026",
    progress: 100,
    datasets: 2,
    dashboards: 2,
    lastActivity: "3 hours ago",
  },
];

const completedProjects: ActiveProject[] = [
  {
    id: "proj4",
    title: "Quarterly Financial Report",
    client: "InvestCo",
    budget: 3000,
    status: "completed",
    deadline: "Dec 20, 2025",
    startDate: "Dec 1, 2025",
    progress: 100,
    datasets: 4,
    dashboards: 3,
    lastActivity: "Jan 5, 2026",
  },
  {
    id: "proj5",
    title: "User Behavior Analysis",
    client: "AppDev Studios",
    budget: 2200,
    status: "completed",
    deadline: "Dec 15, 2025",
    startDate: "Nov 25, 2025",
    progress: 100,
    datasets: 2,
    dashboards: 2,
    lastActivity: "Dec 15, 2025",
  },
];

function getStatusBadge(status: ProjectStatus) {
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

function ProjectCard({ project, showActions = true }: { project: ActiveProject; showActions?: boolean }) {
  return (
    <Card data-testid={`card-project-${project.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {project.client}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(project.status)}
            <div className="text-lg font-bold">${project.budget.toLocaleString()}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Deadline</p>
              <p className="font-medium">{project.deadline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Datasets</p>
              <p className="font-medium">{project.datasets} files</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Dashboards</p>
              <p className="font-medium">{project.dashboards} created</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Last Activity</p>
              <p className="font-medium">{project.lastActivity}</p>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
            <Link href="/analyst/projects/project-1">
              <Button variant="outline" size="sm" data-testid={`button-message-${project.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Client
              </Button>
            </Link>
            <Button variant="outline" size="sm" data-testid={`button-datasets-${project.id}`}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              View Data
            </Button>
            {project.status === "in_progress" && (
              <>
                <Button variant="outline" size="sm" data-testid={`button-upload-${project.id}`}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Dashboard
                </Button>
                <Button size="sm" data-testid={`button-submit-${project.id}`}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Submit for Review
                </Button>
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
  const inProgressProjects = activeProjects.filter(p => p.status === "in_progress");
  const underReviewProjects = activeProjects.filter(p => p.status === "review");

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
