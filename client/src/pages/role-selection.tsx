import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Briefcase, BarChart3, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function RoleSelectionPage() {
  const { user, setRole, isSettingRole, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation();

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
          <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome-title">{t("role_selection.welcome")}</h1>
          <p className="text-muted-foreground" data-testid="text-role-prompt">
            {t("role_selection.choose_role")}
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
              <CardTitle>{t("role_selection.im_client")}</CardTitle>
              <CardDescription>
                {t("role_selection.client_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li>{t("role_selection.client_feat1")}</li>
                <li>{t("role_selection.client_feat2")}</li>
                <li>{t("role_selection.client_feat3")}</li>
                <li>{t("role_selection.client_feat4")}</li>
              </ul>
              <Button
                className="w-full"
                disabled={isSettingRole}
                data-testid="button-select-client"
              >
                {isSettingRole ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("role_selection.continue_client")
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
              <CardTitle>{t("role_selection.im_analyst")}</CardTitle>
              <CardDescription>
                {t("role_selection.analyst_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li>{t("role_selection.analyst_feat1")}</li>
                <li>{t("role_selection.analyst_feat2")}</li>
                <li>{t("role_selection.analyst_feat3")}</li>
                <li>{t("role_selection.analyst_feat4")}</li>
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
                  t("role_selection.continue_analyst")
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
