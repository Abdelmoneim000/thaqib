import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Share2,
  Loader2,
  AlertCircle,
  FileImage,
  FileText
} from "lucide-react";
import { ChartRenderer } from "@/components/bi/chart-renderer";
import { colorPalettes } from "@/lib/bi-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface SharedDashboardData {
  dashboard: {
    id: string;
    name: string;
    description?: string;
    layout?: { items: { id: string; visualizationId: string; width: number; height: number }[] };
  };
  visualizations: {
    id: string;
    name: string;
    chartType: string;
    config?: {
      xAxis?: string;
      yAxis?: string;
      categoryField?: string;
      valueField?: string;
      colors?: { primary: string; palette: string[] };
      formatting?: any;
    };
  }[];
  data: Record<string, Record<string, unknown>[]>;
  allowExport: boolean;
}

export default function SharedDashboardPage() {
  const params = useParams<{ token: string }>();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<SharedDashboardData>({
    queryKey: ["/api/shared", params.token],
    queryFn: async () => {
      const res = await fetch(`/api/shared/${params.token}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load dashboard");
      }
      return res.json();
    },
    enabled: !!params.token,
  });

  const handleExportImage = async () => {
    if (!data?.allowExport) {
      toast({ title: "Export disabled", description: "The owner has disabled exports for this dashboard", variant: "destructive" });
      return;
    }

    const dashboardEl = document.getElementById("shared-dashboard-content");
    if (!dashboardEl) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(dashboardEl, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `${data.dashboard.name.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({ title: "Exported!", description: "Dashboard saved as PNG" });
    } catch (err) {
      toast({ title: "Export failed", description: "Could not export dashboard", variant: "destructive" });
    }
  };

  const handleExportPDF = async () => {
    if (!data?.allowExport) {
      toast({ title: "Export disabled", description: "The owner has disabled exports for this dashboard", variant: "destructive" });
      return;
    }

    const dashboardEl = document.getElementById("shared-dashboard-content");
    if (!dashboardEl) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(dashboardEl, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${data.dashboard.name.replace(/\s+/g, "_")}.pdf`);

      toast({ title: "Exported!", description: "Dashboard saved as PDF" });
    } catch (err) {
      toast({ title: "Export failed", description: "Could not export dashboard", variant: "destructive" });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Dashboard link copied to clipboard" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Dashboard Not Found</h2>
            <p className="text-muted-foreground">
              {(error as Error)?.message || "This dashboard link may have expired or been removed."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { dashboard, visualizations, data: vizData, allowExport } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold" data-testid="text-dashboard-title">{dashboard.name}</h1>
                <Badge variant="secondary">Shared</Badge>
              </div>
              {dashboard.description && (
                <p className="text-sm text-muted-foreground mt-1">{dashboard.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyLink} data-testid="button-copy-link">
                <Share2 className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              {allowExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" data-testid="button-export">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportImage} data-testid="menu-export-image">
                      <FileImage className="h-4 w-4 mr-2" />
                      Export as PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF} data-testid="menu-export-pdf">
                      <FileText className="h-4 w-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6" id="shared-dashboard-content">
        <div className="grid grid-cols-12 gap-4">
          {visualizations.map((viz) => {
            const vizChartData = vizData[viz.id] || [];
            const layoutItem = dashboard.layout?.items.find(i => i.visualizationId === viz.id);
            const width = layoutItem?.width || 6;

            return (
              <div
                key={viz.id}
                className="col-span-12 md:col-span-6"
                style={{ gridColumn: `span ${Math.min(width, 12)}` }}
                data-testid={`viz-card-${viz.id}`}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{viz.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartRenderer
                      type={viz.chartType as any}
                      data={vizChartData}
                      xAxis={viz.config?.xAxis}
                      yAxis={viz.config?.yAxis}
                      categoryField={viz.config?.categoryField || viz.config?.xAxis}
                      valueField={viz.config?.valueField || viz.config?.yAxis}
                      colors={viz.config?.colors || { primary: colorPalettes.default[0], palette: colorPalettes.default }}
                      formatting={viz.config?.formatting || {}}
                    />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {visualizations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">This dashboard has no visualizations yet.</p>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        Powered by Thaqib Analytics
      </footer>
    </div>
  );
}
