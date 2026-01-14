import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth";
import ClientProjectsPage from "@/pages/client/projects";
import ClientProjectDetailPage from "@/pages/client/project-detail";
import DatasetUploadPage from "@/pages/client/dataset-upload";
import AnalystDashboardPage from "@/pages/analyst/dashboard";
import BrowseProjectsPage from "@/pages/analyst/browse";
import ApplicationsPage from "@/pages/analyst/applications";
import AnalystProjectsPage from "@/pages/analyst/projects";
import AnalystSettingsPage from "@/pages/analyst/settings";
import DashboardsPage from "@/pages/analyst/dashboards";
import VisualizationBuilderPage from "@/pages/analyst/visualization-builder";
import SampleDashboardPage from "@/pages/analyst/sample-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/client/projects" component={ClientProjectsPage} />
      <Route path="/client/projects/:id" component={ClientProjectDetailPage} />
      <Route path="/client/projects/:id/upload" component={DatasetUploadPage} />
      <Route path="/analyst/dashboard" component={AnalystDashboardPage} />
      <Route path="/analyst/browse" component={BrowseProjectsPage} />
      <Route path="/analyst/applications" component={ApplicationsPage} />
      <Route path="/analyst/projects" component={AnalystProjectsPage} />
      <Route path="/analyst/dashboards" component={DashboardsPage} />
      <Route path="/analyst/visualization-builder" component={VisualizationBuilderPage} />
      <Route path="/analyst/sample-dashboard" component={SampleDashboardPage} />
      <Route path="/analyst/settings" component={AnalystSettingsPage} />
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
