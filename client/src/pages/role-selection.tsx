import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Briefcase, BarChart3, Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function RoleSelectionPage() {
  const { user, setRole, isSettingRole, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user?.role && user.role !== "") {
      navigate(user.role === "client" ? "/client/projects" : "/analyst/dashboard");
    }
  }, [user, navigate]);

  const handleRoleSelection = (role: "client" | "analyst") => {
    setRole(role, {
      onSuccess: () => {
        navigate(role === "client" ? "/client/projects" : "/analyst/dashboard");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome-title">Welcome to DataWork</h1>
          <p className="text-muted-foreground" data-testid="text-role-prompt">
            Choose how you want to use the platform
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card 
            className="cursor-pointer transition-all hover-elevate"
            onClick={() => !isSettingRole && handleRoleSelection("client")}
            data-testid="card-role-client"
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>I'm a Client</CardTitle>
              <CardDescription>
                I want to post projects and hire data analysts
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li>Post data analysis projects</li>
                <li>Upload datasets securely</li>
                <li>Review analyst proposals</li>
                <li>Receive interactive dashboards</li>
              </ul>
              <Button 
                className="w-full" 
                disabled={isSettingRole}
                data-testid="button-select-client"
              >
                {isSettingRole ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Continue as Client"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover-elevate"
            onClick={() => !isSettingRole && handleRoleSelection("analyst")}
            data-testid="card-role-analyst"
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/10">
                <BarChart3 className="h-8 w-8 text-chart-2" />
              </div>
              <CardTitle>I'm an Analyst</CardTitle>
              <CardDescription>
                I want to find projects and deliver insights
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li>Browse available projects</li>
                <li>Submit proposals to clients</li>
                <li>Build interactive dashboards</li>
                <li>Manage your portfolio</li>
              </ul>
              <Button 
                className="w-full" 
                variant="secondary"
                disabled={isSettingRole}
                data-testid="button-select-analyst"
              >
                {isSettingRole ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Continue as Analyst"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
