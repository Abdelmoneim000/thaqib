import { useState, useRef } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  FolderKanban,
  Calendar,
  Users,
  MoreVertical,
  FileSpreadsheet,
  Loader2,
  Upload,
  BarChart3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Project, Dataset } from "@shared/schema";

type ProjectStatus = "draft" | "open" | "in_progress" | "completed" | "cancelled";

// Extended Project type for UI
interface UIProject extends Project {
  applicants?: number;
  datasets?: number;
}

const ANALYSIS_TYPES = [
  { value: "descriptive", label: "Descriptive Analysis" },
  { value: "diagnostic", label: "Diagnostic Analysis" },
  { value: "predictive", label: "Predictive Analysis" },
  { value: "prescriptive", label: "Prescriptive Analysis" },
];

const ANALYSIS_FIELDS = [
  { value: "financial", label: "Financial" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "customer", label: "Customer" },
  { value: "hr", label: "Human Resources" },
  { value: "product", label: "Product" },
  { value: "others", label: "Others" },
];

function getStatusBadge(status: string) {
  const variants: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    open: { label: "Open", className: "bg-chart-2/10 text-chart-2" },
    in_progress: { label: "In Progress", className: "bg-chart-4/10 text-chart-4" },
    completed: { label: "Completed", className: "bg-chart-1/10 text-chart-1" },
    cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
  };
  const { label, className } = variants[status] || variants.open;
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [analysisType, setAnalysisType] = useState("");
  const [analysisField, setAnalysisField] = useState("");
  const [customAnalysisField, setCustomAnalysisField] = useState("");
  const [deadline, setDeadline] = useState("");
  const [datasetMode, setDatasetMode] = useState<"none" | "upload" | "existing">("none");
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing datasets for selection
  const { data: existingDatasets } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
    enabled: open,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return await res.json();
    },
    onSuccess: async (project) => {
      // Handle dataset attachment after project creation
      if (datasetMode === "upload" && fileInputRef.current?.files?.[0]) {
        const formData = new FormData();
        formData.append("file", fileInputRef.current.files[0]);
        formData.append("projectId", project.id);
        try {
          await fetch("/api/datasets", { method: "POST", body: formData });
        } catch {
          toast({ title: "Dataset upload failed", description: "Project created but dataset could not be uploaded.", variant: "destructive" });
        }
      } else if (datasetMode === "existing" && selectedDatasetId) {
        try {
          await apiRequest("PATCH", `/api/datasets/${selectedDatasetId}`, { projectId: project.id });
        } catch {
          toast({ title: "Dataset link failed", description: "Project created but dataset could not be linked.", variant: "destructive" });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
      toast({ title: "Project created", description: "Your project has been posted successfully." });
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create project", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAnalysisType("");
    setAnalysisField("");
    setCustomAnalysisField("");
    setDeadline("");
    setDatasetMode("none");
    setSelectedDatasetId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }

    createProjectMutation.mutate({
      title,
      description,
      analysisType: analysisType || null,
      analysisField: analysisField === "others" ? "others" : (analysisField || null),
      customAnalysisField: analysisField === "others" ? customAnalysisField : null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      status: "open"
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-create-project">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Define your data analysis project. Analysts will be able to apply.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Project Name <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Customer Churn Analysis"
              required
              data-testid="input-project-title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Analysis Type</Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger data-testid="select-analysis-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ANALYSIS_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Analysis Field</Label>
              <Select value={analysisField} onValueChange={setAnalysisField}>
                <SelectTrigger data-testid="select-analysis-field">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {ANALYSIS_FIELDS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {analysisField === "others" && (
            <div className="space-y-2">
              <Label htmlFor="custom-field">Custom Analysis Field</Label>
              <Input
                id="custom-field"
                value={customAnalysisField}
                onChange={(e) => setCustomAnalysisField(e.target.value)}
                placeholder="Specify your analysis field"
                data-testid="input-custom-field"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you need analyzed and expected deliverables..."
              className="min-h-[100px]"
              data-testid="input-project-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              type="date"
              data-testid="input-project-deadline"
            />
          </div>

          {/* Dataset Attachment */}
          <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
            <Label className="font-medium">Dataset Attachment</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={datasetMode === "none" ? "default" : "outline"}
                size="sm"
                onClick={() => setDatasetMode("none")}
                className="text-xs"
              >
                None
              </Button>
              <Button
                type="button"
                variant={datasetMode === "upload" ? "default" : "outline"}
                size="sm"
                onClick={() => setDatasetMode("upload")}
                className="text-xs gap-1"
              >
                <Upload className="h-3 w-3" />
                Upload
              </Button>
              <Button
                type="button"
                variant={datasetMode === "existing" ? "default" : "outline"}
                size="sm"
                onClick={() => setDatasetMode("existing")}
                className="text-xs gap-1"
              >
                <FileSpreadsheet className="h-3 w-3" />
                Existing
              </Button>
            </div>

            {datasetMode === "upload" && (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  data-testid="input-dataset-file"
                />
                <p className="text-xs text-muted-foreground">Supported formats: .csv (Max 50MB)</p>
              </div>
            )}

            {datasetMode === "existing" && (
              <Select value={selectedDatasetId} onValueChange={setSelectedDatasetId}>
                <SelectTrigger data-testid="select-existing-dataset">
                  <SelectValue placeholder="Choose a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {existingDatasets?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createProjectMutation.isPending}
              data-testid="button-cancel-project"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending} data-testid="button-submit-project">
              {createProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProjectCard({ project }: { project: UIProject }) {
  return (
    <Link href={`/client/projects/${project.id}`}>
      <Card className="border-card-border bg-card hover-elevate cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-3 flex-1">
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
                  onClick={(e) => e.preventDefault()}
                  data-testid={`button-project-menu-${project.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
        <CardContent className="pt-0 mt-auto">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            {project.analysisType && (
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                <span className="capitalize">{project.analysisType}</span>
              </div>
            )}
            {project.deadline && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{project.applicants ?? 0} applicants</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{project.datasets ?? 0} datasets</span>
            </div>
          </div>
          <div>
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
  const { data: projects, isLoading } = useQuery<UIProject[]>({
    queryKey: ["/api/projects"],
  });

  if (isLoading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ClientLayout>
    );
  }

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
          {projects && projects.length > 0 && <CreateProjectDialog />}
        </div>

        {!projects || projects.length === 0 ? (
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
