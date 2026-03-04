import AnalystLayout from "@/components/analyst-layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Application } from "@shared/schema";
import {
  Calendar,
  DollarSign,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  HourglassIcon,
  MessageSquare,
  Loader2,
  FileText
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface EnrichedApplication extends Application {
  projectTitle: string;
  projectBudget: number;
  projectDeadline?: string;
  clientName: string;
  projectStatus?: string;
}

function getStatusBadge(status: string) {
  const { t } = useTranslation();
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <HourglassIcon className="h-3 w-3" />
          {t("analyst_applications.pending")}
        </Badge>
      );
    case "accepted":
      return (
        <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {t("analyst_applications.accepted")}
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          {t("analyst_applications.rejected")}
        </Badge>
      );
    case "withdrawn":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          {t("analyst_applications.withdrawn")}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function ApplicationCard({ application, onWithdraw, isWithdrawing }: { application: EnrichedApplication; onWithdraw: (id: string) => void; isWithdrawing: boolean }) {
  const { t } = useTranslation();
  return (
    <Card data-testid={`card-application-${application.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">{application.projectTitle}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {application.clientName}
            </CardDescription>
          </div>
          {getStatusBadge(application.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">{t("analyst_applications.budget")}</p>
              <p className="font-medium">${(application.projectBudget || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">{t("analyst_applications.deadline")}</p>
              <p className="font-medium">{application.projectDeadline ? new Date(application.projectDeadline).toLocaleDateString() : t("analyst_applications.no_deadline")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">{t("analyst_applications.applied_on")}</p>
              <p className="font-medium">{new Date(application.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {application.coverLetter && (
          <div className="p-3 rounded-md bg-muted/50">
            <p className="text-sm text-muted-foreground italic line-clamp-2">
              "{application.coverLetter}"
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">
          {application.status === "pending" && (
            <Button variant="outline" size="sm" disabled={isWithdrawing} data-testid={`button-withdraw-${application.id}`} onClick={() => {
              onWithdraw(application.id);
            }}>
              {isWithdrawing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("analyst_applications.withdraw_app")}
            </Button>
          )}
          {application.status === "accepted" && (
            application.projectStatus === "completed" ? (
              <Button size="sm" disabled title="Project is completed">
                {t("analyst_applications.project_completed")}
              </Button>
            ) : (
              <Link href={`/analyst/projects/${application.projectId}`}>
                <Button size="sm" data-testid={`button-start-project-${application.id}`}>
                  {t("analyst_applications.start_project")}
                </Button>
              </Link>
            )
          )}
          <Link href={`/analyst/projects/${application.projectId}`}>
            <Button variant={application.status === "accepted" ? "default" : "secondary"} size="sm" data-testid={`button-view-project-${application.projectId}`}>
              {t("analyst_applications.view_project")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AnalystApplicationsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: applications, isLoading } = useQuery<EnrichedApplication[]>({
    queryKey: ["/api/applications"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({ title: t("analyst_applications.withdrawn", { defaultValue: "Withdrawn" }), description: t("analyst_applications.withdraw_success", { defaultValue: "Application has been successfully withdrawn." }) });
    },
    onError: (err: Error) => {
      toast({ title: t("common.error", { defaultValue: "Error" }), description: err.message || t("analyst_applications.withdraw_failed", { defaultValue: "Failed to withdraw application." }), variant: "destructive" });
    }
  });

  const pendingApps = applications?.filter(a => a.status === "pending") || [];
  const acceptedApps = applications?.filter(a => a.status === "accepted") || [];
  const rejectedApps = applications?.filter(a => a.status === "rejected") || [];

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
          <h1 className="text-2xl font-semibold tracking-tight">{t("analyst_applications.title")}</h1>
          <p className="text-muted-foreground">
            {t("analyst_applications.description")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("analyst_applications.pending")}
              </CardTitle>
              <HourglassIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApps.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("analyst_applications.accepted")}
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{acceptedApps.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("analyst_applications.rejected")}
              </CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{rejectedApps.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("analyst_applications.total")}
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="all" data-testid="tab-all">
              {t("analyst_applications.all")} ({applications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">
              {t("analyst_applications.pending")} ({pendingApps.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" data-testid="tab-accepted">
              {t("analyst_applications.accepted")} ({acceptedApps.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">
              {t("analyst_applications.rejected")} ({rejectedApps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {(applications || []).length > 0 ? (
              applications?.map((app) => (
                <ApplicationCard key={app.id} application={app} onWithdraw={(id) => deleteMutation.mutate(id)} isWithdrawing={deleteMutation.isPending && deleteMutation.variables === app.id} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {t("analyst_applications.no_apps")}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingApps.length > 0 ? (
              pendingApps.map((app) => (
                <ApplicationCard key={app.id} application={app} onWithdraw={(id) => deleteMutation.mutate(id)} isWithdrawing={deleteMutation.isPending && deleteMutation.variables === app.id} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <HourglassIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t("analyst_applications.no_pending")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4 mt-4">
            {acceptedApps.length > 0 ? (
              acceptedApps.map((app) => (
                <ApplicationCard key={app.id} application={app} onWithdraw={(id) => deleteMutation.mutate(id)} isWithdrawing={deleteMutation.isPending && deleteMutation.variables === app.id} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t("analyst_applications.no_accepted")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-4">
            {rejectedApps.length > 0 ? (
              rejectedApps.map((app) => (
                <ApplicationCard key={app.id} application={app} onWithdraw={(id) => deleteMutation.mutate(id)} isWithdrawing={deleteMutation.isPending && deleteMutation.variables === app.id} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t("analyst_applications.no_rejected")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AnalystLayout>
  );
}
