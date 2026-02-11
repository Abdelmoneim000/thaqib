import { useState } from "react";
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
  Loader2
} from "lucide-react";
import { ProjectChat } from "@/components/chat/project-chat";
import type { Project, Application, Dataset, Dashboard } from "@shared/schema";

// Extended Application type with enriched data from API
interface EnrichedApplication extends Application {
  analystName: string;
  analystEmail: string;
  analystSkills: string; // comma separated
}

function ApplicantCard({
  applicant,
  onAccept,
  onReject,
  onChat
}: {
  applicant: EnrichedApplication;
  onAccept: () => void;
  onReject: () => void;
  onChat: () => void;
}) {
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
                <Badge className="bg-chart-2/10 text-chart-2 border-0">Accepted</Badge>
              )}
              {applicant.status === "rejected" && (
                <Badge className="bg-destructive/10 text-destructive border-0">Rejected</Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              {/* Rating mock for now as it's not in schema yet */}
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-chart-4 fill-chart-4" />
                4.8
              </span>
              <span>{skills.length} skills</span>
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
            <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-medium">
                ${applicant.proposedBudget?.toLocaleString() ?? 0}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onChat}
                  data-testid={`button-chat-${applicant.id}`}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                {applicant.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onReject}
                      data-testid={`button-reject-${applicant.id}`}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={onAccept}
                      data-testid={`button-accept-${applicant.id}`}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <Card className="border-card-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-1/10">
              <FileSpreadsheet className="h-5 w-5 text-chart-1" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{dataset.fileName}</p>
              <p className="text-sm text-muted-foreground">
                {dataset.fileSize ? `${(dataset.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'} • Uploaded {dataset.createdAt ? new Date(dataset.createdAt).toLocaleDateString() : 'Unknown date'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              data-testid={`button-preview-${dataset.id}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              data-testid={`button-download-${dataset.id}`}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardCard({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Card className="border-card-border bg-card hover-elevate cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
            <BarChart3 className="h-5 w-5 text-chart-3" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{dashboard.name}</p>
            <p className="text-sm text-muted-foreground">
              {dashboard.description || "No description"} • {dashboard.createdAt ? new Date(dashboard.createdAt).toLocaleDateString() : 'Unknown date'}
            </p>
          </div>
          <Button variant="outline" size="sm" data-testid={`button-view-dashboard-${dashboard.id}`}>
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

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
      return apiRequest("POST", "/api/conversations", {
        otherUserId: analystId, // Updated to use otherUserId as per API
        analystName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setLocation("/client/chats");
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
      open: { label: "Open", className: "bg-chart-2/10 text-chart-2" },
      in_progress: { label: "In Progress", className: "bg-chart-4/10 text-chart-4" },
      completed: { label: "Completed", className: "bg-chart-1/10 text-chart-1" },
      cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
    };
    const { label, className } = variants[status] || variants.draft;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // Fetch user for chat
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
              Back to Projects
            </button>
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
                {getStatusBadge(project.status)}
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {project.description}
              </p>
            </div>
            <Link href={`/client/projects/${project.id}/upload`}>
              <Button className="gap-2 shrink-0" data-testid="button-upload-dataset">
                <Upload className="h-4 w-4" />
                Upload Dataset
              </Button>
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              <span>${project.budget?.toLocaleString()} budget</span>
            </div>
            {project.deadline && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{applicants?.length || 0} applicants</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{datasets?.length || 0} datasets</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="applicants" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="applicants" data-testid="tab-applicants">
              <Users className="h-4 w-4 mr-2" />
              Applicants
            </TabsTrigger>
            <TabsTrigger value="datasets" data-testid="tab-datasets">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Datasets
            </TabsTrigger>
            <TabsTrigger value="dashboards" data-testid="tab-dashboards">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboards
            </TabsTrigger>
            <TabsTrigger value="chat" data-testid="tab-chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applicants">
            {isApplicantsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (!applicants || applicants.length === 0) ? (
              <Card className="border-card-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-1">No applicants yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Analysts will appear here when they apply to your project.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {applicants.map((applicant) => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    onAccept={() => handleAccept(applicant.id)}
                    onReject={() => handleReject(applicant.id)}
                    onChat={() => handleChat(applicant)}
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
                  <DatasetCard key={dataset.id} dataset={dataset} />
                ))}
                {(!datasets || datasets.length === 0) && (
                  <Card className="border-card-border bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-1">No datasets uploaded</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload your data files to get started.
                      </p>
                      <Link href={`/client/projects/${project.id}/upload`}>
                        <Button data-testid="button-upload-empty">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Dataset
                        </Button>
                      </Link>
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
                  <DashboardCard key={dashboard.id} dashboard={dashboard} />
                ))}
                {(!dashboards || dashboards.length === 0) && (
                  <Card className="border-card-border bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-1">No dashboards yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Dashboards will appear here when your analyst delivers them.
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
      </div>
    </ClientLayout>
  );
}
