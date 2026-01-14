import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  BarChart3
} from "lucide-react";
import { ChartRenderer, MetricCard } from "@/components/bi/chart-renderer";
import { colorPalettes } from "@/lib/bi-types";

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
            <Button variant="outline" size="sm" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" data-testid="button-share">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

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
    </AnalystLayout>
  );
}
