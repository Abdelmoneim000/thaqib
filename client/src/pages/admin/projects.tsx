import { useQuery, useMutation } from "@tanstack/react-query";
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
    FolderKanban,
    Users,
    CheckCircle2,
    XCircle,
    Trash2,
    ChevronRight,
    Loader2,
    User,
    Clock,
} from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, Application } from "@shared/schema";
import { useTranslation } from "react-i18next";

interface ProjectWithDetails extends Project {
    clientName: string;
    analystName: string | null;
    applicantCount: number;
    pendingApplicants: number;
}

interface ApplicationWithDetails extends Application {
    analystName: string;
    analystEmail: string;
    analystSkills: string;
}

export default function AdminProjectsPage() {
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const { toast } = useToast();
    const { t } = useTranslation();

    const { data: projects, isLoading } = useQuery<ProjectWithDetails[]>({
        queryKey: ["/api/admin/projects"],
    });

    const { data: applications, isLoading: isLoadingApps } = useQuery<ApplicationWithDetails[]>({
        queryKey: ["/api/admin/projects", selectedProjectId, "applications"],
        queryFn: async () => {
            if (!selectedProjectId) return [];
            const res = await fetch(`/api/admin/projects/${selectedProjectId}/applications`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch applications");
            return res.json();
        },
        enabled: !!selectedProjectId,
    });

    const acceptMutation = useMutation({
        mutationFn: async (applicationId: string) => {
            await apiRequest("PATCH", `/api/applications/${applicationId}`, { status: "accepted" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/projects", selectedProjectId, "applications"],
            });
            toast({ title: "Analyst accepted and assigned to project" });
        },
        onError: () => {
            toast({ title: "Failed to accept application", variant: "destructive" });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (applicationId: string) => {
            await apiRequest("PATCH", `/api/applications/${applicationId}`, { status: "rejected" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/projects", selectedProjectId, "applications"],
            });
            toast({ title: "Application rejected" });
        },
        onError: () => {
            toast({ title: "Failed to reject application", variant: "destructive" });
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: async (projectId: string) => {
            await apiRequest("DELETE", `/api/admin/projects/${projectId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
            setSelectedProjectId(null);
            toast({ title: "Project deleted" });
        },
        onError: () => {
            toast({ title: "Failed to delete project", variant: "destructive" });
        },
    });

    const selectedProject = projects?.find((p) => p.id === selectedProjectId);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open":
                return "bg-blue-100 text-blue-800";
            case "in_progress":
                return "bg-yellow-100 text-yellow-800";
            case "submitted":
                return "bg-purple-100 text-purple-800";
            case "completed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold" data-testid="text-page-title">
                        {t("admin.manage_projects")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("admin.manage_projects_desc")}
                    </p>
                </div>

                <div className="flex gap-6">
                    {/* Projects Table */}
                    <Card className="flex-1" data-testid="card-projects-list">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FolderKanban className="h-4 w-4" />
                                {t("admin.all_projects")} ({projects?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : !projects?.length ? (
                                <p className="text-muted-foreground text-center py-8">
                                    {t("projects.no_projects")}
                                </p>
                            ) : (
                                <div className="overflow-auto max-h-[60vh]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t("projects.project_title")}</TableHead>
                                                <TableHead>{t("projects.client")}</TableHead>
                                                <TableHead>{t("projects.status")}</TableHead>
                                                <TableHead>{t("projects.applicants")}</TableHead>
                                                <TableHead>{t("projects.analyst")}</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {projects.map((project) => (
                                                <TableRow
                                                    key={project.id}
                                                    className={`cursor-pointer ${selectedProjectId === project.id ? "bg-muted" : ""
                                                        }`}
                                                    onClick={() => setSelectedProjectId(project.id)}
                                                    data-testid={`project-row-${project.id}`}
                                                >
                                                    <TableCell className="font-medium max-w-[200px] truncate">
                                                        {project.title}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {project.clientName}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(project.status)}>
                                                            {project.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            <span>{project.applicantCount}</span>
                                                            {project.pendingApplicants > 0 && (
                                                                <Badge variant="secondary" className="text-xs ml-1">
                                                                    {project.pendingApplicants} {t("common.new")}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {project.analystName || "—"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Project Detail + Applications */}
                    {selectedProject && (
                        <Card className="w-[420px] shrink-0" data-testid="card-project-detail">
                            <CardHeader className="border-b">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{selectedProject.title}</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => {
                                            if (confirm(t("admin.delete_confirm"))) {
                                                deleteProjectMutation.mutate(selectedProject.id);
                                            }
                                        }}
                                        disabled={deleteProjectMutation.isPending}
                                        data-testid="button-delete-project"
                                    >
                                        {deleteProjectMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {/* Project Info */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t("projects.client")}:</span>
                                        <span className="font-medium">{selectedProject.clientName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t("projects.status")}:</span>
                                        <Badge className={getStatusColor(selectedProject.status)}>
                                            {selectedProject.status}
                                        </Badge>
                                    </div>
                                    {selectedProject.analystName && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("admin.assigned")}:</span>
                                            <span className="font-medium">{selectedProject.analystName}</span>
                                        </div>
                                    )}
                                    {selectedProject.analysisType && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("common.type")}:</span>
                                            <span>{selectedProject.analysisType}</span>
                                        </div>
                                    )}
                                    {selectedProject.budget && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("projects.budget")}:</span>
                                            <span>${selectedProject.budget.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedProject.deadline && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("projects.deadline")}:</span>
                                            <span>
                                                {new Date(selectedProject.deadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {selectedProject.description && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground block mb-1">{t("projects.description")}:</span>
                                        <p className="text-xs bg-muted rounded p-2">{selectedProject.description}</p>
                                    </div>
                                )}

                                {/* Applicants Section */}
                                <div>
                                    <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {t("admin.applicants")} ({applications?.length || 0})
                                    </h3>

                                    {isLoadingApps ? (
                                        <div className="space-y-2">
                                            {[1, 2].map((i) => (
                                                <Skeleton key={i} className="h-20 w-full" />
                                            ))}
                                        </div>
                                    ) : !applications?.length ? (
                                        <p className="text-xs text-muted-foreground text-center py-4">
                                            {t("admin.no_applications")}
                                        </p>
                                    ) : (
                                        <div className="space-y-2 max-h-[300px] overflow-auto">
                                            {applications.map((app) => (
                                                <div
                                                    key={app.id}
                                                    className="border rounded-lg p-3 space-y-2"
                                                    data-testid={`application-${app.id}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                                <User className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-medium">
                                                                    {app.analystName}
                                                                </span>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {app.analystEmail}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant={
                                                                app.status === "accepted"
                                                                    ? "default"
                                                                    : app.status === "rejected"
                                                                        ? "destructive"
                                                                        : "secondary"
                                                            }
                                                        >
                                                            {app.status}
                                                        </Badge>
                                                    </div>

                                                    {app.analystSkills && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {t("auth.skills")}: {app.analystSkills}
                                                        </p>
                                                    )}

                                                    {app.coverLetter && (
                                                        <p className="text-xs bg-muted rounded p-2">
                                                            {app.coverLetter}
                                                        </p>
                                                    )}

                                                    {app.proposedBudget && (
                                                        <p className="text-xs">
                                                            {t("common.proposed_budget")}: ${app.proposedBudget.toLocaleString()}
                                                        </p>
                                                    )}

                                                    {app.status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 h-7 text-xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    acceptMutation.mutate(app.id);
                                                                }}
                                                                disabled={acceptMutation.isPending}
                                                                data-testid={`button-accept-${app.id}`}
                                                            >
                                                                {acceptMutation.isPending ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                )}
                                                                Accept
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="flex-1 h-7 text-xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    rejectMutation.mutate(app.id);
                                                                }}
                                                                disabled={rejectMutation.isPending}
                                                                data-testid={`button-reject-${app.id}`}
                                                            >
                                                                {rejectMutation.isPending ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <XCircle className="h-3 w-3 mr-1" />
                                                                )}
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
