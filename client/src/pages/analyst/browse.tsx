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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Project, Application } from "@shared/schema";
import {
  Search,
  Calendar,
  Users,
  Building2,
  Clock,
  BarChart3,
  Loader2
} from "lucide-react";

const ANALYSIS_TYPES = [
  { value: "all", label: "All Types" },
  { value: "descriptive", label: "Descriptive" },
  { value: "diagnostic", label: "Diagnostic" },
  { value: "predictive", label: "Predictive" },
  { value: "prescriptive", label: "Prescriptive" },
];

const ANALYSIS_FIELDS = [
  { value: "all", label: "All Fields" },
  { value: "financial", label: "Financial" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "customer", label: "Customer" },
  { value: "hr", label: "Human Resources" },
  { value: "product", label: "Product" },
  { value: "others", label: "Others" },
];

export default function BrowseProjectsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedField, setSelectedField] = useState("all");
  const [applyingTo, setApplyingTo] = useState<Project | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects?status=open"],
  });

  const { data: myApplications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: { projectId: string; coverLetter: string }) => {
      const res = await apiRequest("POST", "/api/applications", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your application has been submitted. The admin will review it shortly."
      });
      setApplyingTo(null);
      setCoverLetter("");
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit application",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleApply = () => {
    if (!applyingTo) return;
    createApplicationMutation.mutate({
      projectId: applyingTo.id,
      coverLetter,
    });
  };

  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "all" || project.analysisType === selectedType;
    const matchesField = selectedField === "all" || project.analysisField === selectedField;

    return matchesSearch && matchesType && matchesField;
  }) || [];

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
          <h1 className="text-2xl font-semibold tracking-tight">Browse Projects</h1>
          <p className="text-muted-foreground">
            Find data analysis projects that match your skills
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-projects"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[160px]" data-testid="select-analysis-type">
                    <SelectValue placeholder="Analysis Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANALYSIS_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger className="w-[160px]" data-testid="select-analysis-field">
                    <SelectValue placeholder="Analysis Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANALYSIS_FIELDS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProjects.length} projects
          </p>
        </div>

        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const isApplied = myApplications?.some(app => app.projectId === project.id);
            return (
              <Card key={project.id} data-testid={`card-project-${project.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Client Project
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.analysisType && (
                        <Badge variant="secondary" className="capitalize">
                          {project.analysisType}
                        </Badge>
                      )}
                      {project.analysisField && (
                        <Badge variant="outline" className="capitalize">
                          {project.analysisField === "others" && project.customAnalysisField
                            ? project.customAnalysisField
                            : project.analysisField}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{project.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Posted {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {isApplied ? (
                      <Button disabled variant="outline">Applied</Button>
                    ) : (
                      <Dialog open={applyingTo?.id === project.id} onOpenChange={(open) => !open && setApplyingTo(null)}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setApplyingTo(project)}
                            data-testid={`button-apply-${project.id}`}
                          >
                            Apply Now
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Apply to Project</DialogTitle>
                            <DialogDescription>
                              Submit your application for "{project.title}"
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="cover">Cover Letter</Label>
                              <Textarea
                                id="cover"
                                placeholder="Explain why you're the best fit for this project..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                rows={6}
                                data-testid="textarea-cover-letter"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setApplyingTo(null)} data-testid="button-cancel-application">
                              Cancel
                            </Button>
                            <Button onClick={handleApply} disabled={createApplicationMutation.isPending} data-testid="button-submit-application">
                              {createApplicationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Submit Application
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search or filters to find more projects
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AnalystLayout>
  );
}
