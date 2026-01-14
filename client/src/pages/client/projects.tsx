import { useState } from "react";
import ClientLayout from "@/components/client-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  FolderKanban, 
  Calendar, 
  DollarSign,
  Users,
  MoreVertical,
  FileSpreadsheet
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProjectStatus = "draft" | "open" | "in_progress" | "completed" | "cancelled";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: ProjectStatus;
  deadline: string;
  applicants: number;
  datasets: number;
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Customer Churn Analysis",
    description: "Analyze customer data to identify patterns leading to churn and provide actionable insights.",
    budget: 2500,
    status: "open",
    deadline: "2025-02-15",
    applicants: 5,
    datasets: 2,
  },
  {
    id: "2",
    title: "Sales Forecast Dashboard",
    description: "Build an interactive dashboard to forecast quarterly sales based on historical data.",
    budget: 4000,
    status: "in_progress",
    deadline: "2025-03-01",
    applicants: 8,
    datasets: 3,
  },
  {
    id: "3",
    title: "Marketing ROI Analysis",
    description: "Evaluate marketing campaign performance and calculate ROI across different channels.",
    budget: 1800,
    status: "completed",
    deadline: "2025-01-20",
    applicants: 3,
    datasets: 1,
  },
  {
    id: "4",
    title: "Inventory Optimization",
    description: "Analyze inventory levels and suggest optimal stock quantities to reduce costs.",
    budget: 3200,
    status: "draft",
    deadline: "2025-04-01",
    applicants: 0,
    datasets: 0,
  },
];

function getStatusBadge(status: ProjectStatus) {
  const variants: Record<ProjectStatus, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    open: { label: "Open", className: "bg-chart-2/10 text-chart-2" },
    in_progress: { label: "In Progress", className: "bg-chart-4/10 text-chart-4" },
    completed: { label: "Completed", className: "bg-chart-1/10 text-chart-1" },
    cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
  };
  const { label, className } = variants[status];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

function CreateProjectDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-create-project">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Post a new data analysis project for analysts to apply.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input 
              id="title" 
              placeholder="e.g., Customer Churn Analysis" 
              data-testid="input-project-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe what you need analyzed and the expected deliverables..."
              className="min-h-[100px]"
              data-testid="input-project-description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input 
                id="budget" 
                type="number" 
                placeholder="2500" 
                data-testid="input-project-budget"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input 
                id="deadline" 
                type="date" 
                data-testid="input-project-deadline"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              data-testid="button-cancel-project"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit-project">
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/client/projects/${project.id}`}>
    <Card className="border-card-border bg-card hover-elevate cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-base font-medium truncate">
              {project.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {project.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0"
                data-testid={`button-project-menu-${project.id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid={`menu-edit-${project.id}`}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem data-testid={`menu-view-${project.id}`}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                data-testid={`menu-delete-${project.id}`}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            <span>${project.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{project.applicants} applicants</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4" />
            <span>{project.datasets} datasets</span>
          </div>
        </div>
        <div className="mt-4">
          {getStatusBadge(project.status)}
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FolderKanban className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium">No projects yet</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Create your first project to start working with data analysts.
      </p>
      <CreateProjectDialog />
    </div>
  );
}

export default function ClientProjectsPage() {
  const projects = mockProjects;

  return (
    <ClientLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Projects</h1>
            <p className="text-sm text-muted-foreground">
              Manage your data analysis projects
            </p>
          </div>
          {projects.length > 0 && <CreateProjectDialog />}
        </div>

        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
