import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { 
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  BarChart3,
  Copy,
  Check,
  FileImage,
  FileText,
  Loader2
} from "lucide-react";
import { ChartRenderer } from "@/components/bi/chart-renderer";
import { colorPalettes } from "@/lib/bi-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const revenueByRegion = [
  { region: "North", revenue: 197000 },
  { region: "South", revenue: 171000 },
  { region: "East", revenue: 226000 },
  { region: "West", revenue: 181000 },
];

const monthlyTrend = [
  { month: "Jan", revenue: 176000, profit: 47500 },
  { month: "Feb", revenue: 189000, profit: 51500 },
  { month: "Mar", revenue: 201000, profit: 55500 },
  { month: "Apr", revenue: 209000, profit: 58000 },
];

const productMix = [
  { name: "Widget A", value: 368000 },
  { name: "Widget B", value: 407000 },
];

const customerSegments = [
  { segment: "Enterprise", customers: 1650, value: 2833 },
  { segment: "SMB", customers: 4100, value: 483 },
  { segment: "Consumer", customers: 12000, value: 121 },
];

export default function SampleDashboardPage() {
  const { toast } = useToast();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [allowExport, setAllowExport] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState(7);

  const shareMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/dashboards/dashboard-1/share", {
        expiresInDays,
        allowExport,
      });
      return res.json();
    },
    onSuccess: (data) => {
      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      setShareLink(fullUrl);
    },
    onError: () => {
      toast({ title: "Share failed", description: "Could not create share link", variant: "destructive" });
    }
  });

  const handleShare = () => {
    setShareDialogOpen(true);
    shareMutation.mutate();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({ title: "Copied!", description: "Share link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportImage = async () => {
    const dashboardEl = document.getElementById("dashboard-content");
    if (!dashboardEl) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(dashboardEl, { 
        backgroundColor: "#ffffff",
        scale: 2,
      });
      
      const link = document.createElement("a");
      link.download = "sales_performance_dashboard.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast({ title: "Exported!", description: "Dashboard saved as PNG" });
    } catch (err) {
      toast({ title: "Export failed", description: "Could not export dashboard", variant: "destructive" });
    }
  };

  const handleExportPDF = async () => {
    const dashboardEl = document.getElementById("dashboard-content");
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
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("sales_performance_dashboard.pdf");
      
      toast({ title: "Exported!", description: "Dashboard saved as PDF" });
    } catch (err) {
      toast({ title: "Export failed", description: "Could not export dashboard", variant: "destructive" });
    }
  };

  return (
    <AnalystLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/analyst/dashboards">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">Sales Performance Dashboard</h1>
                <Badge>Published</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                TechCorp Analytics - Updated 2 hours ago
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-export">
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
            <Button size="sm" onClick={handleShare} data-testid="button-share">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div id="dashboard-content" className="space-y-6 bg-background">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-metric-revenue">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$775,000</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.5% from last quarter
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-metric-profit">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Profit
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$212,500</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.3% from last quarter
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-metric-customers">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">17,750</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2,340 new this month
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-metric-orders">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Order Value
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$485</div>
                <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  -3.2% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card data-testid="card-chart-revenue-region">
              <CardHeader>
                <CardTitle className="text-base">Revenue by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartRenderer
                  type="bar"
                  data={revenueByRegion}
                  xAxis="region"
                  yAxis="revenue"
                  categoryField="region"
                  valueField="revenue"
                  colors={{ primary: colorPalettes.default[0], palette: colorPalettes.default }}
                  formatting={{ numberFormat: "currency", decimals: 0, showGrid: true, showLegend: false }}
                />
              </CardContent>
            </Card>

            <Card data-testid="card-chart-monthly-trend">
              <CardHeader>
                <CardTitle className="text-base">Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartRenderer
                  type="line"
                  data={monthlyTrend}
                  xAxis="month"
                  yAxis="revenue"
                  categoryField="month"
                  valueField="revenue"
                  colors={{ primary: colorPalettes.cool[0], palette: colorPalettes.cool }}
                  formatting={{ numberFormat: "currency", decimals: 0, showGrid: true, showLegend: true }}
                />
              </CardContent>
            </Card>

            <Card data-testid="card-chart-product-mix">
              <CardHeader>
                <CardTitle className="text-base">Product Mix</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartRenderer
                  type="donut"
                  data={productMix}
                  categoryField="name"
                  valueField="value"
                  colors={{ primary: colorPalettes.warm[0], palette: colorPalettes.warm }}
                  formatting={{ numberFormat: "currency", decimals: 0, showLegend: true, showLabels: true }}
                />
              </CardContent>
            </Card>

            <Card data-testid="card-chart-segments">
              <CardHeader>
                <CardTitle className="text-base">Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartRenderer
                  type="table"
                  data={customerSegments}
                  formatting={{ numberFormat: "number", decimals: 0 }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Dashboard</DialogTitle>
            <DialogDescription>
              Create a shareable link for this dashboard
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {shareMutation.isPending ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : shareLink ? (
              <>
                <div className="space-y-2">
                  <Label>Share Link</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={shareLink} 
                      readOnly 
                      className="flex-1"
                      data-testid="input-share-link"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleCopyLink}
                      data-testid="button-copy-link"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Export</Label>
                    <p className="text-xs text-muted-foreground">
                      Let viewers download as PDF or image
                    </p>
                  </div>
                  <Switch 
                    checked={allowExport} 
                    onCheckedChange={setAllowExport}
                    data-testid="switch-allow-export"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Link Expires</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 7)}
                      className="w-20"
                      min={1}
                      max={365}
                      data-testid="input-expires-days"
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnalystLayout>
  );
}
