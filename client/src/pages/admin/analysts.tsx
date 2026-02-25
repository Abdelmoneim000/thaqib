import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderKanban,
  MessageSquare,
  ChevronRight,
  UserPlus,
  UserMinus,
  UserCog,
  Loader2,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { User, Project } from "@shared/schema";
import { useTranslation } from "react-i18next";

export default function AdminAnalystsPage() {
  const [selectedAnalyst, setSelectedAnalyst] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const { toast } = useToast();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  const impersonateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/impersonate/${userId}`);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries();
      toast({ title: "Impersonating", description: `Now viewing as ${data.firstName} ${data.lastName}` });
      navigate("/analyst/browse");
    },
    onError: () => {
      toast({ title: "Failed", description: "Could not impersonate this user", variant: "destructive" });
    },
  });

  const { data: analysts, isLoading: isLoadingAnalysts } = useQuery<User[]>({
    queryKey: ["/api/admin/users", "analyst"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users?role=analyst", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analysts");
      return res.json();
    },
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
  });

  const assignMutation = useMutation({
    mutationFn: async ({ projectId, analystId }: { projectId: string; analystId: string | null }) => {
      const res = await apiRequest("PATCH", `/api/projects/${projectId}`, {
        analystId,
        status: analystId ? "in_progress" : "open"
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      toast({ title: "Project updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update project", variant: "destructive" });
    },
  });

  const getAnalystProjects = (analystId: string) => {
    return projects?.filter(p => p.analystId === analystId) || [];
  };

  const getOpenProjects = () => {
    return projects?.filter(p => !p.analystId || p.status === "open") || [];
  };

  const selectedAnalystData = selectedAnalyst ? analysts?.find(a => a.id === selectedAnalyst) : null;

  const handleAssignProject = () => {
    if (selectedProject && selectedAnalyst) {
      assignMutation.mutate({ projectId: selectedProject, analystId: selectedAnalyst });
      setSelectedProject("");
    }
  };

  const handleRemoveFromProject = (projectId: string) => {
    assignMutation.mutate({ projectId, analystId: null });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Analysts</h1>
          <p className="text-muted-foreground">Manage analyst accounts and project assignments</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card data-testid="card-analysts-list">
            <CardHeader>
              <CardTitle>All Analysts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAnalysts ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : analysts?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No analysts yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Active Projects</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysts?.map((analyst) => (
                      <TableRow
                        key={analyst.id}
                        className={selectedAnalyst === analyst.id ? "bg-muted" : ""}
                        data-testid={`row-analyst-${analyst.id}`}
                      >
                        <TableCell className="font-medium">
                          {analyst.firstName} {analyst.lastName}
                        </TableCell>
                        <TableCell>{analyst.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getAnalystProjects(analyst.id).length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setSelectedAnalyst(analyst.id)}
                            data-testid={`button-view-analyst-${analyst.id}`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-analyst-details">
            <CardHeader>
              <CardTitle>
                {selectedAnalystData
                  ? `${selectedAnalystData.firstName} ${selectedAnalystData.lastName}`
                  : "Select an Analyst"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedAnalyst ? (
                <p className="text-muted-foreground text-center py-8">
                  Select an analyst to view their details
                </p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <UserPlus className="h-4 w-4" />
                      Assign to Project
                    </h3>
                    <div className="flex gap-2">
                      <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="flex-1" data-testid="select-project">
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {getOpenProjects().map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAssignProject}
                        disabled={!selectedProject || assignMutation.isPending}
                        data-testid="button-assign-project"
                      >
                        Assign
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <FolderKanban className="h-4 w-4" />
                      Active Projects ({getAnalystProjects(selectedAnalyst).length})
                    </h3>
                    {isLoadingProjects ? (
                      <Skeleton className="h-20 w-full" />
                    ) : getAnalystProjects(selectedAnalyst).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No active projects</p>
                    ) : (
                      <div className="space-y-2">
                        {getAnalystProjects(selectedAnalyst).map(project => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between p-2 border rounded"
                            data-testid={`project-${project.id}`}
                          >
                            <div>
                              <span className="font-medium">{project.title}</span>
                              <Badge
                                variant={project.status === "completed" ? "default" : "secondary"}
                                className="ml-2"
                              >
                                {project.status}
                              </Badge>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveFromProject(project.id)}
                              disabled={assignMutation.isPending}
                              data-testid={`button-remove-${project.id}`}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    data-testid="button-chat-analyst"
                    onClick={async () => {
                      if (!selectedAnalyst) return;
                      try {
                        await apiRequest("POST", "/api/admin/conversations", { userId: selectedAnalyst });
                        navigate("/admin/chats");
                      } catch {
                        toast({ title: "Failed to start chat", variant: "destructive" });
                      }
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => selectedAnalyst && impersonateMutation.mutate(selectedAnalyst)}
                    disabled={impersonateMutation.isPending}
                    data-testid="button-impersonate-analyst"
                  >
                    {impersonateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserCog className="h-4 w-4" />
                    )}
                    View as Analyst
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={async () => {
                      if (!selectedAnalyst) return;
                      if (!confirm("Delete this account? This cannot be undone.")) return;
                      try {
                        await apiRequest("DELETE", `/api/admin/users/${selectedAnalyst}`);
                        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
                        setSelectedAnalyst(null);
                        toast({ title: "Account deleted" });
                      } catch {
                        toast({ title: "Failed to delete account", variant: "destructive" });
                      }
                    }}
                    data-testid="button-delete-analyst"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
