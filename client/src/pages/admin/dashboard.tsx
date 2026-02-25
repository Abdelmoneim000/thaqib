import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderKanban,
  CheckCircle2,
  DollarSign,
  Users,
  UserCheck,
  Briefcase,
  ArrowRight,
  LayoutDashboard,
  BarChart3
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface AdminStats {
  projectsToday: number;
  projectsSubmitted: number;
  totalRevenue: number;
  totalUsers: number;
  totalClients: number;
  totalAnalysts: number;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });
  const { t } = useTranslation();

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("admin.dashboard")}</h1>
          <p className="text-muted-foreground">{t("admin.manage_projects_desc")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card data-testid="card-projects-today">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.projects_today")}</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-projects-today">
                  {stats?.projectsToday || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">New projects created today</p>
            </CardContent>
          </Card>

          <Card data-testid="card-projects-submitted">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.projects_submitted")}</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-projects-submitted">
                  {stats?.projectsSubmitted || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Completed projects</p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-revenue">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.total_revenue")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-total-revenue">
                  ${(stats?.totalRevenue || 0).toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Total platform fees collected</p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-users">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.total_users")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-total-users">
                  {stats?.totalUsers || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-clients">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.total_clients")}</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-total-clients">
                  {stats?.totalClients || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Business accounts</p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-analysts">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.total_analysts")}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-total-analysts">
                  {stats?.totalAnalysts || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Freelance data analysts</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover-elevate" data-testid="card-client-dashboard">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Client Dashboard</CardTitle>
                    <CardDescription>Post projects and manage datasets</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/client/projects">
                  <Button className="w-full" data-testid="button-goto-client">
                    Go to Client Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-analyst-dashboard">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Analyst Dashboard</CardTitle>
                    <CardDescription>Browse projects and build visualizations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/analyst/dashboard">
                  <Button className="w-full" data-testid="button-goto-analyst">
                    Go to Analyst Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
