import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
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
  Loader2
} from "lucide-react";

interface EnrichedApplication extends Application {
  projectTitle: string;
  projectBudget: number;
  projectDeadline?: string;
  clientName: string;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <HourglassIcon className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "accepted":
      return (
        <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Accepted
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    case "withdrawn":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          Withdrawn
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function ApplicationCard({ application }: { application: EnrichedApplication }) {
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Your Proposal</p>
            <div className="flex items-center gap-1 font-medium">
              <DollarSign className="h-4 w-4" />
              {(application.proposedBudget || 0).toLocaleString()}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Client Budget</p>
            <div className="flex items-center gap-1 font-medium">
              <DollarSign className="h-4 w-4" />
              {(application.projectBudget || 0).toLocaleString()}
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

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Applied: {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Unknown'}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Deadline: {application.projectDeadline ? new Date(application.projectDeadline).toLocaleDateString() : 'N/A'}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {application.status === "pending" && (
            <>
              {/* Withdraw functionality requires backend support, placeholder for now 
              <Button variant="outline" size="sm" data-testid={`button-withdraw-${application.id}`}>
                Withdraw
              </Button>
              */}
              {/* Message Client functionality would link to chat/messages 
              <Button variant="outline" size="sm" data-testid={`button-message-${application.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Client
              </Button>
              */}
            </>
          )}
          {application.status === "accepted" && (
            <Button size="sm" data-testid={`button-start-project-${application.id}`}>
              Start Project
            </Button>
          )}
          {/* View Project would link to project details */}
          <Button variant="ghost" size="sm" data-testid={`button-view-project-${application.id}`}>
            View Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApplicationsPage() {
  const { data: applications, isLoading } = useQuery<EnrichedApplication[]>({
    queryKey: ["/api/applications"],
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
          <h1 className="text-2xl font-semibold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground">
            Track the status of your project applications
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
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
                Accepted
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
                Rejected
              </CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{rejectedApps.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              All ({(applications || []).length})
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending ({pendingApps.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" data-testid="tab-accepted">
              Accepted ({acceptedApps.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">
              Rejected ({rejectedApps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {(applications || []).length > 0 ? (
              applications?.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No applications found.
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingApps.length > 0 ? (
              pendingApps.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <HourglassIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending applications</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4 mt-4">
            {acceptedApps.length > 0 ? (
              acceptedApps.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No accepted applications yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-4">
            {rejectedApps.length > 0 ? (
              rejectedApps.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No rejected applications</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AnalystLayout>
  );
}
