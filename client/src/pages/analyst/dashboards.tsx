import { useState } from "react";
import { Link } from "wouter";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  LayoutDashboard,
  BarChart3,
  Search,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SavedDashboard {
  id: string;
  name: string;
  description?: string;
  projectName?: string;
  chartCount: number;
  lastEdited: string;
  status: "draft" | "published";
}

const savedDashboards: SavedDashboard[] = [
  {
    id: "dash1",
    name: "Sales Performance Overview",
    description: "Monthly sales metrics and regional breakdown",
    projectName: "TechCorp Analytics",
    chartCount: 4,
    lastEdited: "2 hours ago",
    status: "published",
  },
  {
    id: "dash2",
    name: "Customer Segmentation Analysis",
    description: "Customer demographics and behavior patterns",
    projectName: "RetailMax Insights",
    chartCount: 6,
    lastEdited: "1 day ago",
    status: "draft",
  },
  {
    id: "dash3",
    name: "Marketing Campaign Results",
    description: "ROI analysis for Q4 campaigns",
    projectName: "GrowthLabs Report",
    chartCount: 3,
    lastEdited: "3 days ago",
    status: "published",
  },
];

interface SavedVisualization {
  id: string;
  name: string;
  type: string;
  datasetName: string;
  lastEdited: string;
}

const savedVisualizations: SavedVisualization[] = [
  {
    id: "viz1",
    name: "Revenue by Region",
    type: "bar",
    datasetName: "Sales Data 2024",
    lastEdited: "1 hour ago",
  },
  {
    id: "viz2",
    name: "Monthly Trend",
    type: "line",
    datasetName: "Sales Data 2024",
    lastEdited: "2 hours ago",
  },
  {
    id: "viz3",
    name: "Customer Distribution",
    type: "pie",
    datasetName: "Customer Analytics",
    lastEdited: "1 day ago",
  },
  {
    id: "viz4",
    name: "Retention by Segment",
    type: "bar",
    datasetName: "Customer Analytics",
    lastEdited: "2 days ago",
  },
];

export default function DashboardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState("");
  const [newDashboardDesc, setNewDashboardDesc] = useState("");

  const filteredDashboards = savedDashboards.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDashboard = () => {
    console.log("Creating dashboard:", newDashboardName);
    setIsCreateDialogOpen(false);
    setNewDashboardName("");
    setNewDashboardDesc("");
  };

  return (
    <AnalystLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboards & Visualizations</h1>
            <p className="text-muted-foreground">
              Create and manage your data visualizations
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/analyst/visualization-builder">
              <Button variant="outline" data-testid="button-new-viz">
                <BarChart3 className="h-4 w-4 mr-2" />
                New Visualization
              </Button>
            </Link>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-dashboard">
                  <Plus className="h-4 w-4 mr-2" />
                  New Dashboard
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Dashboard</DialogTitle>
                  <DialogDescription>
                    Create a blank dashboard to add visualizations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Dashboard Name</Label>
                    <Input
                      id="name"
                      value={newDashboardName}
                      onChange={(e) => setNewDashboardName(e.target.value)}
                      placeholder="e.g., Q1 Sales Report"
                      data-testid="input-new-dashboard-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description (optional)</Label>
                    <Textarea
                      id="desc"
                      value={newDashboardDesc}
                      onChange={(e) => setNewDashboardDesc(e.target.value)}
                      placeholder="Brief description of the dashboard"
                      data-testid="textarea-new-dashboard-desc"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDashboard} data-testid="button-create-dashboard">
                    Create Dashboard
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-dashboards"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Dashboards</h2>
            {filteredDashboards.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Dashboards Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first dashboard to get started
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDashboards.map((dashboard) => (
                  <Link key={dashboard.id} href="/analyst/sample-dashboard">
                    <Card 
                      className="hover-elevate cursor-pointer h-full"
                      data-testid={`card-dashboard-${dashboard.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{dashboard.name}</CardTitle>
                            {dashboard.projectName && (
                              <CardDescription>{dashboard.projectName}</CardDescription>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {dashboard.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {dashboard.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BarChart3 className="h-4 w-4" />
                            {dashboard.chartCount} charts
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={dashboard.status === "published" ? "default" : "secondary"}>
                              {dashboard.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3" />
                          Edited {dashboard.lastEdited}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Saved Visualizations</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {savedVisualizations.map((viz) => (
                <Card 
                  key={viz.id}
                  className="hover-elevate cursor-pointer"
                  data-testid={`card-viz-${viz.id}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{viz.name}</p>
                        <p className="text-sm text-muted-foreground">{viz.datasetName}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {viz.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                      <Clock className="h-3 w-3" />
                      {viz.lastEdited}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnalystLayout>
  );
}
