import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  Save,
  Move,
  Maximize2,
  Minimize2,
  LayoutGrid
} from "lucide-react";
import { ChartRenderer } from "./chart-renderer";
import type { Dashboard, DashboardItem, Visualization } from "@/lib/bi-types";

interface DashboardBuilderProps {
  dashboard: Dashboard;
  visualizations: Visualization[];
  queryResults: Map<string, Record<string, unknown>[]>;
  onSave: (dashboard: Dashboard) => void;
  onAddVisualization: () => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateLayout: (items: DashboardItem[]) => void;
}

export function DashboardBuilder({
  dashboard,
  visualizations,
  queryResults,
  onSave,
  onAddVisualization,
  onRemoveItem,
  onUpdateLayout,
}: DashboardBuilderProps) {
  const [dashboardName, setDashboardName] = useState(dashboard.name);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const handleSave = () => {
    onSave({ ...dashboard, name: dashboardName });
  };

  const resizeItem = (itemId: string, newWidth: number, newHeight: number) => {
    const updatedItems = dashboard.items.map(item => 
      item.id === itemId ? { ...item, width: newWidth, height: newHeight } : item
    );
    onUpdateLayout(updatedItems);
  };

  const getVisualization = (vizId: string) => {
    return visualizations.find(v => v.id === vizId);
  };

  const getData = (vizId: string) => {
    return queryResults.get(vizId) || [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="text-lg font-semibold max-w-md"
            placeholder="Dashboard Name"
            data-testid="input-dashboard-name"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onAddVisualization} data-testid="button-add-viz">
            <Plus className="h-4 w-4 mr-2" />
            Add Chart
          </Button>
          <Button onClick={handleSave} data-testid="button-save-dashboard">
            <Save className="h-4 w-4 mr-2" />
            Save Dashboard
          </Button>
        </div>
      </div>

      {dashboard.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Empty Dashboard</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add visualizations to build your dashboard
            </p>
            <Button onClick={onAddVisualization} data-testid="button-add-first-viz">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Chart
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-12 gap-4 auto-rows-min">
          {dashboard.items.map((item) => {
            const viz = getVisualization(item.visualizationId);
            const data = getData(item.visualizationId);
            
            if (!viz) return null;

            const colSpan = Math.min(item.width, 12);
            const isSmall = colSpan <= 4;

            return (
              <div
                key={item.id}
                className={`relative group`}
                style={{ 
                  gridColumn: `span ${colSpan}`,
                  minHeight: isSmall ? "200px" : "350px"
                }}
                data-testid={`dashboard-item-${item.id}`}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
                    <CardTitle className="text-base truncate">{viz.name}</CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => resizeItem(item.id, Math.min(item.width + 3, 12), item.height)}
                        data-testid={`button-expand-${item.id}`}
                      >
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => resizeItem(item.id, Math.max(item.width - 3, 3), item.height)}
                        data-testid={`button-shrink-${item.id}`}
                      >
                        <Minimize2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => onRemoveItem(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ChartRenderer
                      type={viz.type}
                      data={data}
                      xAxis={viz.xAxis}
                      yAxis={viz.yAxis}
                      categoryField={viz.categoryField}
                      valueField={viz.valueField}
                      colors={viz.colors}
                      formatting={viz.formatting}
                    />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface DashboardGridProps {
  items: { id: string; title: string; element: React.ReactNode; width?: number }[];
}

export function DashboardGrid({ items }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className={`col-span-${item.width || 6}`}
          style={{ gridColumn: `span ${item.width || 6}` }}
        >
          {item.element}
        </div>
      ))}
    </div>
  );
}
