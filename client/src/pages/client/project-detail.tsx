
import { useRef } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import ClientLayout from "@/components/client-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  BarChart3,
  Upload,
  Eye,
  Download,
  Star,
  MessageSquare,
  Loader2,
  Check,
  Edit,
  Trash2,
} from "lucide-react";
import { ProjectChat } from "@/components/chat/project-chat";
import type { Project, Application, Dataset, Dashboard } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

// Extended Application type with enriched data from API
interface EnrichedApplication extends Application {
  analystName: string;
  analystEmail: string;
  analystSkills: string; // comma separated
  analystRating?: number;
}

function ApplicantCard({
  applicant,
}: {
  applicant: EnrichedApplication;
}) {
  const { t } = useTranslation();
  const skills = applicant.analystSkills ? applicant.analystSkills.split(',').map(s => s.trim()) : [];

  return (
    <Card className="border-card-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {applicant.analystName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium truncate">{applicant.analystName}</h3>
              {applicant.status === "accepted" && (
                <Badge className="bg-chart-2/10 text-chart-2 border-0">{t("project_detail.accepted")}</Badge>
              )}
              {applicant.status === "rejected" && (
                <Badge className="bg-destructive/10 text-destructive border-0">{t("project_detail.rejected")}</Badge>
              )}
              {applicant.status === "pending" && (
                <Badge className="bg-chart-4/10 text-chart-4 border-0">{t("project_detail.pending_review")}</Badge>
              )}
              {applicant.status === "withdrawn" && (
                <Badge variant="secondary" className="border-0">{t("project_detail.withdrawn")}</Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-chart-4 fill-chart-4" />
                {applicant.analystRating || "N/A"}
              </span>
              <span>{skills.length} {t("project_detail.skills")}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{skills.length - 3}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{applicant.coverLetter}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



function DashboardCard({ dashboard, onReview }: { dashboard: Dashboard; onReview: (id: string, status: 'approved' | 'rejected', feedback?: string) => void }) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { t } = useTranslation();
  return (
    <>
      <Card className="border-card-border bg-card hover-elevate cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
              <BarChart3 className="h-5 w-5 text-chart-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{dashboard.name}</p>
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
              <p className="text-sm text-muted-foreground">
                {dashboard.description || "No description"} • {dashboard.createdAt ? new Date(dashboard.createdAt).toLocaleDateString() : 'Unknown date'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/analyst/dashboard/${dashboard.id}`}>
                <Button variant="outline" size="sm" data-testid={`button-view-dashboard-${dashboard.id}`}>
                  View
                </Button>
              </Link>
              {dashboard.status === "submitted" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onReview(dashboard.id, 'approved')}>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      {t("project_detail.approve")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsRejectOpen(true)}>
                      <XCircle className="mr-2 h-4 w-4 text-destructive" />
                      {t("project_detail.reject")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("project_detail.reject_dashboard")}</DialogTitle>
            <DialogDescription>
              {t("project_detail.provide_feedback")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t("project_detail.enter_feedback")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>{t("project_detail.cancel")}</Button>
            <Button
              variant="destructive"
              onClick={() => {
                onReview(dashboard.id, 'rejected', feedback);
                setIsRejectOpen(false);
              }}
            >
              {t("project_detail.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DatasetCard({ dataset, onDelete }: { dataset: Dataset; onDelete: (id: string) => void }) {
  const { t } = useTranslation();
  return (
    <Card className="border-card-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-1/10">
              <FileSpreadsheet className="h-5 w-5 text-chart-1" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{dataset.name}</p>
              <p className="text-sm text-muted-foreground">
                {dataset.fileSize ? `${(dataset.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'} • {t("project_detail.uploaded")} {dataset.createdAt ? new Date(dataset.createdAt).toLocaleDateString() : 'Unknown date'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/datasets/${dataset.id}/download-link`);
                      if (!res.ok) throw new Error("Failed to get download link");
                      const { downloadUrl } = await res.json();
                      window.open(downloadUrl, '_blank');
                    } catch (err) {
                      console.error("Download failed:", err);
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("project_detail.download")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(dataset.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("project_detail.remove_from_project")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



export default function ClientProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  // Fetch Project
  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  // Fetch Applicants
  const { data: applicants, isLoading: isApplicantsLoading } = useQuery<EnrichedApplication[]>({
    queryKey: [`/api/applications`, { projectId: id }],
    enabled: !!id,
  });

  // Fetch Datasets
  const { data: datasets, isLoading: isDatasetsLoading } = useQuery<Dataset[]>({
    queryKey: [`/api/datasets`, { projectId: id }],
    enabled: !!id,
  });

  // Fetch Dashboards
  const { data: dashboards, isLoading: isDashboardsLoading } = useQuery<Dashboard[]>({
    queryKey: [`/api/dashboards`, { projectId: id }],
    enabled: !!id,
  });

  const startChatMutation = useMutation({
    mutationFn: async ({ analystId, analystName }: { analystId: string; analystName: string }) => {
      const res = await apiRequest("POST", "/api/conversations", {
        otherUserId: analystId, // Updated to use otherUserId as per API
        analystName,
        projectId: id, // Pass current project ID
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setLocation(`/client/chats?conversationId=${data.id}`);
    },
  });

  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ appId, status }: { appId: string; status: "accepted" | "rejected" }) => {
      const res = await apiRequest("PATCH", `/api/applications/${appId}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications`, { projectId: id }] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
    },
  });

  // Delete Dataset Mutation
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
  const unlinkDatasetMutation = useMutation({
    mutationFn: async (id: string) => {
      // Unlink by setting projectId to null
      await apiRequest("PATCH", `/api/datasets/${id}`, { projectId: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/datasets`, { projectId: id }] });
      toast({ title: "Dataset removed", description: "The dataset has been removed from this project." });
      setDatasetToDelete(null);
    },
    onError: () => {
      toast({ title: "Removal failed", description: "Could not remove dataset from project.", variant: "destructive" });
    }
  });

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const submitRatingMutation = useMutation({
    mutationFn: async () => {
      // 1. Submit Rating
      if (project?.analystId) {
        await apiRequest("POST", "/api/ratings", {
          projectId: project.id,
          revieweeId: project.analystId,
          rating,
          comment
        });
      }

      // 2. Mark Project as Completed
      await apiRequest("PATCH", `/api/projects/${id}`, {
        status: "completed"
      });
    },
    onSuccess: () => {
      toast({ title: "Project Completed", description: "Project marked as completed and rating submitted." });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      setIsReviewOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to complete project", variant: "destructive" });
    }
  });

  const handleCompleteProject = () => {
    submitRatingMutation.mutate();
  };

  const reviewDashboardMutation = useMutation({
    mutationFn: async ({ id, status, feedback }: { id: string; status: 'approved' | 'rejected'; feedback?: string }) => {
      const res = await apiRequest("PATCH", `/api/dashboards/${id}`, { status, feedback });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboards`, { projectId: id }] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      toast({ title: "Dashboard reviewed", description: "Feedback has been sent to the analyst." });
    },
    onError: () => {
      toast({ title: "Review failed", description: "Could not submit review.", variant: "destructive" });
    }
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(project?.title || "");
  const [editDescription, setEditDescription] = useState(project?.description || "");

  const updateProjectMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/projects/${id}`, {
        title: editTitle,
        description: editDescription
      });
    },
    onSuccess: () => {
      toast({ title: "Project Updated", description: "Project details have been updated." });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      setIsEditOpen(false);
    },
    onError: () => {
      toast({ title: "Update Failed", description: "Failed to update project details.", variant: "destructive" });
    }
  });

  const handleUpdateProject = () => {
    updateProjectMutation.mutate();
  };

  // Pre-fill edit form when opening
  const onEditOpenChange = (open: boolean) => {
    if (open && project) {
      setEditTitle(project.title);
      setEditDescription(project.description || "");
    }
    setIsEditOpen(open);
  };

  const handleChat = (applicant: EnrichedApplication) => {
    startChatMutation.mutate({
      analystId: applicant.analystId,
      analystName: applicant.analystName,
    });
  };

  const handleAccept = (applicantId: string) => {
    updateApplicationStatusMutation.mutate({ appId: applicantId, status: "accepted" });
  };

  const handleReject = (applicantId: string) => {
    updateApplicationStatusMutation.mutate({ appId: applicantId, status: "rejected" });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
      pending_approval: { label: t("client_projects.pending_approval"), className: "bg-orange-500/10 text-orange-600 border-orange-200" },
      awaiting_client_approval: { label: t("client_projects.awaiting_client_approval", { defaultValue: "Awaiting Your Approval" }), className: "bg-cyan-500/10 text-cyan-600 border-cyan-200" },
      open: { label: "Open", className: "bg-chart-2/10 text-chart-2" },
      in_progress: { label: "In Progress", className: "bg-chart-4/10 text-chart-4" },
      completed: { label: "Completed", className: "bg-chart-1/10 text-chart-1" },
      cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
    };
    const { label, className } = variants[status] || variants.draft;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const [isRejectBudgetOpen, setIsRejectBudgetOpen] = useState(false);
  const [budgetRejectionReason, setBudgetRejectionReason] = useState("");

  const reviewBudgetMutation = useMutation({
    mutationFn: async ({ status, rejectionReason }: { status: "open" | "pending_approval", rejectionReason?: string }) => {
      await apiRequest("PATCH", `/api/projects/${id}`, { status, rejectionReason: rejectionReason || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: t("project_detail.budget_reviewed", { defaultValue: "Budget reviewed successfully" }) });
      setIsRejectBudgetOpen(false);
    },
    onError: () => {
      toast({ title: t("project_detail.budget_review_failed", { defaultValue: "Failed to review budget" }), variant: "destructive" });
    }
  });

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({ title: "Invalid file type", description: "Please upload a CSV file", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", id!);

    try {
      await apiRequest("POST", "/api/datasets", formData);
      toast({ title: "Dataset uploaded", description: "Your dataset has been successfully uploaded and processed." });
      queryClient.invalidateQueries({ queryKey: [`/api/datasets`, { projectId: id }] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
    } catch (error) {
      toast({ title: "Upload failed", description: "Failed to upload dataset", variant: "destructive" });
    } finally {
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const { user } = useAuth();


  if (isProjectLoading || !project) {
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
        <div className="mb-6">
          <Link href="/client/projects">
            <button
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
              data-testid="button-back-projects"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("project_detail.back_to_projects")}
            </button>
          </Link>



          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
                {(project.status === "draft" || project.status === "open") && (
                  <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("project_detail.edit_project_details")}</DialogTitle>
                        <DialogDescription>
                          {t("project_detail.update_project_details")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">{t("project_detail.title")}</Label>
                          <input
                            id="title"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">{t("project_detail.description")}</Label>
                          <Textarea
                            id="description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={5}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>{t("project_detail.cancel")}</Button>
                        <Button onClick={handleUpdateProject} disabled={updateProjectMutation.isPending}>
                          {updateProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t("project_detail.save_changes")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                {getStatusBadge(project.status)}
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {project.description}
              </p>

              {/* Client Budget Review Action Banner */}
              {project.status === "awaiting_client_approval" && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-md p-4 mt-4 max-w-2xl space-y-3">
                  <h4 className="font-medium text-sm text-cyan-900 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t("project_detail.budget_proposed", { defaultValue: "Admin Proposed Budget" })}
                  </h4>
                  <p className="text-sm text-cyan-800">
                    {t("project_detail.budget_proposed_desc", { defaultValue: "The administration has reviewed your project and set the following budget constraint. Please accept the budget to publish the project to analysts, or reject it with feedback." })}
                  </p>
                  <div className="bg-white/50 rounded-lg p-4 border border-cyan-100 flex flex-col gap-2 mt-4 mb-2 max-w-sm">
                    <div className="flex justify-between items-center text-sm text-cyan-800">
                      <span>{t("project_detail.analyst_payment", { defaultValue: "Analyst Payment" })}</span>
                      <span className="font-semibold">{project.budget?.toLocaleString() || "0"} $</span>
                    </div>
                    {((project.platformFee ?? 0) > 0) && (
                      <div className="flex justify-between items-center text-sm text-cyan-800">
                        <span>{t("project_detail.commission_fee", { defaultValue: "Commission Fee" })}</span>
                        <span className="font-semibold">{project.platformFee?.toLocaleString() || "0"} $</span>
                      </div>
                    )}
                    <div className="w-full border-t border-cyan-200 my-1"></div>
                    <div className="flex justify-between items-center font-bold text-lg text-emerald-700">
                      <span>{t("project_detail.total_payment", { defaultValue: "Total Amount" })}</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{((project.budget || 0) + (project.platformFee || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => reviewBudgetMutation.mutate({ status: "open" })}
                      disabled={reviewBudgetMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {reviewBudgetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t("project_detail.accept_publish", { defaultValue: "Accept Budget & Publish" })}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setIsRejectBudgetOpen(true)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {t("project_detail.reject_feedback", { defaultValue: "Reject with Feedback" })}
                    </Button>
                  </div>
                </div>
              )}

              {/* Budget Rejection Dialog */}
              <Dialog open={isRejectBudgetOpen} onOpenChange={setIsRejectBudgetOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("project_detail.reject_budget_title", { defaultValue: "Reject Proposed Budget" })}</DialogTitle>
                    <DialogDescription>
                      {t("project_detail.reject_budget_desc", { defaultValue: "Please explain why the proposed budget does not meet your expectations. The project will be sent back to the admin for review." })}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      value={budgetRejectionReason}
                      onChange={(e) => setBudgetRejectionReason(e.target.value)}
                      placeholder={t("project_detail.enter_rejection_reason", { defaultValue: "The budget is too low for the scope of..." })}
                      rows={4}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRejectBudgetOpen(false)}>
                      {t("project_detail.cancel")}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={!budgetRejectionReason.trim() || reviewBudgetMutation.isPending}
                      onClick={() => reviewBudgetMutation.mutate({ status: "pending_approval", rejectionReason: budgetRejectionReason })}
                    >
                      {reviewBudgetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("project_detail.submit_rejection", { defaultValue: "Submit Rejection" })}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileUpload}
                />

                {project.status === "in_progress" && (
                  <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        {t("project_detail.complete_project")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("project_detail.complete_project_and_rate_analyst")}</DialogTitle>
                        <DialogDescription>
                          {t("project_detail.please_rate_the_analysts_performance_to_close_this_project")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Rating</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`p-1 rounded-full hover:bg-muted ${rating >= star ? "text-yellow-500" : "text-muted-foreground"}`}
                              >
                                <Star className={`h-8 w-8 ${rating >= star ? "fill-current" : ""}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="comment">{t("project_detail.comment")}</Label>
                          <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t("project_detail.describe_your_experience_working_with_this_analyst")}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReviewOpen(false)}>{t("project_detail.cancel")}</Button>
                        <Button
                          onClick={handleCompleteProject}
                          disabled={rating === 0 || submitRatingMutation.isPending}
                        >
                          {submitRatingMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          {t("project_detail.submit_and_complete")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {project.deadline && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{t("project_detail.due")} {new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            )}
            {project.budget && (
              <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-4 w-4" />
                <span>{project.budget.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{applicants?.length || 0} {t("project_detail.applicants")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{datasets?.length || 0} {t("project_detail.datasets")}</span>
            </div>
          </div>
        </div >

        <Tabs defaultValue="applicants" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="applicants" data-testid="tab-applicants">
              <Users className="h-4 w-4 mr-2" />
              {t("project_detail.applicants")}
            </TabsTrigger>
            <TabsTrigger value="datasets" data-testid="tab-datasets">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {t("project_detail.datasets")}
            </TabsTrigger>
            <TabsTrigger value="dashboards" data-testid="tab-dashboards">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t("project_detail.dashboards")}
            </TabsTrigger>
            <TabsTrigger value="chat" data-testid="tab-chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t("project_detail.chat")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applicants">
            {isApplicantsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (!applicants || applicants.length === 0) ? (
              <Card className="border-card-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-1">{t("project_detail.no_applicants_yet")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("project_detail.analysts_will_appear_here_when_they_apply_to_your_project")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {applicants.map((applicant) => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="datasets">
            {isDatasetsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-3">
                {datasets?.map((dataset) => (
                  <DatasetCard
                    key={dataset.id}
                    dataset={dataset}
                    onDelete={(id) => setDatasetToDelete(id)}
                  />
                ))}
                {(!datasets || datasets.length === 0) && (
                  <Card className="border-card-border bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-1">{t("project_detail.no_datasets_uploaded")}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("project_detail.upload_your_data_files_to_get_started")}
                      </p>
                      {(project.status === "draft" || project.status === "open") && (
                        <Link href={`/client/projects/${project.id}/upload`}>
                          <Button data-testid="button-upload-empty">
                            <Upload className="h-4 w-4 mr-2" />
                            {t("project_detail.upload_dataset")}
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboards">
            {isDashboardsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-3">
                {dashboards?.map((dashboard) => (
                  <DashboardCard
                    key={dashboard.id}
                    dashboard={dashboard}
                    onReview={(id, status, feedback) => {
                      reviewDashboardMutation.mutate({ id, status, feedback });
                    }}
                  />
                ))}
                {(!dashboards || dashboards.length === 0) && (
                  <Card className="border-card-border bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-1">{t("project_detail.no_dashboards_yet")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("project_detail.dashboards_will_appear_here_when_your_analyst_delivers_them")}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="h-[500px]">
            <ProjectChat
              projectId={project.id}
              currentUserId={user?.id || ""}
              currentUserRole="client"
            />
          </TabsContent>
        </Tabs>
      </div >

      <AlertDialog open={!!datasetToDelete} onOpenChange={(open) => !open && setDatasetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("project_detail.remove_dataset_from_project")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("project_detail.this_will_remove_the_dataset_from_this_project_but_keep_it_in_your_personal_library")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("project_detail.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => datasetToDelete && unlinkDatasetMutation.mutate(datasetToDelete)}
            >
              {unlinkDatasetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("project_detail.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientLayout >
  );
}
