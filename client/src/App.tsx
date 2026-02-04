import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import RoleSelectionPage from "@/pages/role-selection";
import ClientProjectsPage from "@/pages/client/projects";
import ClientProjectDetailPage from "@/pages/client/project-detail";
import ClientChatsPage from "@/pages/client/chats";
import DatasetUploadPage from "@/pages/client/dataset-upload";
import AnalystDashboardPage from "@/pages/analyst/dashboard";
import BrowseProjectsPage from "@/pages/analyst/browse";
import ApplicationsPage from "@/pages/analyst/applications";
import AnalystProjectsPage from "@/pages/analyst/projects";
import AnalystProjectDetailPage from "@/pages/analyst/project-detail";
import AnalystSettingsPage from "@/pages/analyst/settings";
import AnalystChatsPage from "@/pages/analyst/chats";
import DashboardsPage from "@/pages/analyst/dashboards";
import VisualizationBuilderPage from "@/pages/analyst/visualization-builder";
import SampleDashboardPage from "@/pages/analyst/sample-dashboard";
import SharedDashboardPage from "@/pages/shared-dashboard";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminClientsPage from "@/pages/admin/clients";
import AdminAnalystsPage from "@/pages/admin/analysts";
import AdminChatsPage from "@/pages/admin/chats";

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType; allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  if (!user.role || user.role === "") {
    return <Redirect to="/role-selection" />;
  }

  // Admin can access all routes
  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== "admin") {
    return <Redirect to={user.role === "client" ? "/client/projects" : "/analyst/dashboard"} />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/role-selection" component={RoleSelectionPage} />
      <Route path="/shared/:token" component={SharedDashboardPage} />
      <Route path="/client/projects">
        <ProtectedRoute component={ClientProjectsPage} allowedRoles={["client"]} />
      </Route>
      <Route path="/client/projects/:id">
        <ProtectedRoute component={ClientProjectDetailPage} allowedRoles={["client"]} />
      </Route>
      <Route path="/client/projects/:id/upload">
        <ProtectedRoute component={DatasetUploadPage} allowedRoles={["client"]} />
      </Route>
      <Route path="/client/chats">
        <ProtectedRoute component={ClientChatsPage} allowedRoles={["client"]} />
      </Route>
      <Route path="/analyst/dashboard">
        <ProtectedRoute component={AnalystDashboardPage} allowedRoles={["analyst"]} />
      </Route>
      <Route path="/analyst/browse">
        <ProtectedRoute component={BrowseProjectsPage} allowedRoles={["analyst"]} />
      </Route>
      <Route path="/analyst/applications">
        <ProtectedRoute component={ApplicationsPage} allowedRoles={["analyst"]} />
      </Route>
      <Route path="/analyst/projects">
        <ProtectedRoute component={AnalystProjectsPage} allowedRoles={["analyst"]} />
      </Route>
      <Route path="/analyst/projects/:id">
        <ProtectedRoute component={AnalystProjectDetailPage} allowedRoles={["analyst"]} />
      </Route>
      <Route path="/analyst/chats">
        <ProtectedRoute component={AnalystChatsPage} allowedRoles={["analyst"]} />
      </Route>
      <Route path="/analyst/dashboards">
        <ProtectedRoute component={DashboardsPage} allowedRoles={["analyst"]} />
      </Route>
      <Route path="/analyst/visualization-builder">
        <ProtectedRoute component={VisualizationBuilderPage} allowedRoles={["analyst"]} />
      </Route>
      <Route path="/analyst/sample-dashboard">
        <ProtectedRoute component={SampleDashboardPage} allowedRoles={["analyst"]} />
      </Route>
      <Route path="/analyst/settings">
        <ProtectedRoute component={AnalystSettingsPage} allowedRoles={["analyst"]} />
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboardPage} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/clients">
        <ProtectedRoute component={AdminClientsPage} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/analysts">
        <ProtectedRoute component={AdminAnalystsPage} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/chats">
        <ProtectedRoute component={AdminChatsPage} allowedRoles={["admin"]} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
