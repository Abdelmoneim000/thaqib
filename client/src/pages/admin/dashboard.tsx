import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderKanban, 
  CheckCircle2, 
  DollarSign, 
  Users,
  UserCheck,
  Briefcase
} from "lucide-react";

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

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and statistics</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card data-testid="card-projects-today">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects Today</CardTitle>
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
              <CardTitle className="text-sm font-medium">Projects Submitted</CardTitle>
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
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
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
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
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
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
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
              <CardTitle className="text-sm font-medium">Analysts</CardTitle>
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
      </div>
    </AdminLayout>
  );
}
