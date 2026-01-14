import { useState } from "react";
import { Link, useParams } from "wouter";
import ClientLayout from "@/components/client-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Calendar, 
  DollarSign,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Upload,
  Eye,
  Download,
  Star
} from "lucide-react";

interface Applicant {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  proposedRate: number;
  status: "applied" | "accepted" | "rejected";
  rating: number;
  projectsCompleted: number;
}

interface Dataset {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface Dashboard {
  id: string;
  title: string;
  createdAt: string;
  analyst: string;
}

const mockApplicants: Applicant[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "SC",
    skills: ["Python", "SQL", "Tableau", "Machine Learning"],
    proposedRate: 2200,
    status: "applied",
    rating: 4.9,
    projectsCompleted: 24,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    avatar: "MJ",
    skills: ["R", "Power BI", "Statistical Analysis"],
    proposedRate: 2500,
    status: "applied",
    rating: 4.7,
    projectsCompleted: 18,
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    avatar: "ER",
    skills: ["Python", "Pandas", "Data Visualization"],
    proposedRate: 2000,
    status: "accepted",
    rating: 4.8,
    projectsCompleted: 31,
  },
];

const mockDatasets: Dataset[] = [
  {
    id: "1",
    fileName: "customer_data_2024.csv",
    fileSize: "2.4 MB",
    uploadedAt: "2025-01-10",
    uploadedBy: "John Doe",
  },
  {
    id: "2",
    fileName: "transactions_q4.xlsx",
    fileSize: "5.1 MB",
    uploadedAt: "2025-01-12",
    uploadedBy: "John Doe",
  },
];

const mockDashboards: Dashboard[] = [
  {
    id: "1",
    title: "Churn Risk Analysis",
    createdAt: "2025-01-14",
    analyst: "Elena Rodriguez",
  },
];

function ApplicantCard({ 
  applicant, 
  onAccept, 
  onReject 
}: { 
  applicant: Applicant; 
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <Card className="border-card-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {applicant.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium truncate">{applicant.name}</h3>
              {applicant.status === "accepted" && (
                <Badge className="bg-chart-2/10 text-chart-2 border-0">Accepted</Badge>
              )}
              {applicant.status === "rejected" && (
                <Badge className="bg-destructive/10 text-destructive border-0">Rejected</Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-chart-4 fill-chart-4" />
                {applicant.rating}
              </span>
              <span>{applicant.projectsCompleted} projects</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {applicant.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {applicant.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{applicant.skills.length - 3}
                </Badge>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-medium">
                ${applicant.proposedRate.toLocaleString()}
              </span>
              {applicant.status === "applied" && (
                <div className="flex items-center gap-2">
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
                </div>
              )}
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
                {dataset.fileSize} • Uploaded {new Date(dataset.uploadedAt).toLocaleDateString()}
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
            <p className="font-medium truncate">{dashboard.title}</p>
            <p className="text-sm text-muted-foreground">
              By {dashboard.analyst} • {new Date(dashboard.createdAt).toLocaleDateString()}
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
  const [applicants, setApplicants] = useState(mockApplicants);

  const project = {
    id: id || "1",
    title: "Customer Churn Analysis",
    description: "Analyze customer data to identify patterns leading to churn and provide actionable insights. We need to understand which customer segments are most at risk and what factors contribute to churn.",
    budget: 2500,
    status: "in_progress" as const,
    deadline: "2025-02-15",
  };

  const handleAccept = (applicantId: string) => {
    setApplicants(prev => 
      prev.map(a => 
        a.id === applicantId 
          ? { ...a, status: "accepted" as const }
          : a.status === "applied" 
            ? { ...a, status: "rejected" as const }
            : a
      )
    );
  };

  const handleReject = (applicantId: string) => {
    setApplicants(prev => 
      prev.map(a => 
        a.id === applicantId ? { ...a, status: "rejected" as const } : a
      )
    );
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
              <span>${project.budget.toLocaleString()} budget</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{applicants.length} applicants</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{mockDatasets.length} datasets</span>
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
          </TabsList>

          <TabsContent value="applicants">
            {applicants.length === 0 ? (
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
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="datasets">
            <div className="space-y-3">
              {mockDatasets.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
              {mockDatasets.length === 0 && (
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
          </TabsContent>

          <TabsContent value="dashboards">
            <div className="space-y-3">
              {mockDashboards.map((dashboard) => (
                <DashboardCard key={dashboard.id} dashboard={dashboard} />
              ))}
              {mockDashboards.length === 0 && (
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
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
}
