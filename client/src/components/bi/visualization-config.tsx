import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  LineChart,
  PieChart,
  Table2,
  TrendingUp,
  Palette,
  Settings2,
  Hash
} from "lucide-react";
import type { ChartType, ChartColors, ChartFormatting, DataColumn } from "@/lib/bi-types";
import { colorPalettes } from "@/lib/bi-types";

interface VisualizationConfigProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  colors: ChartColors;
  onColorsChange: (colors: ChartColors) => void;
  formatting: ChartFormatting;
  onFormattingChange: (formatting: ChartFormatting) => void;
  columns: DataColumn[];
  xAxis?: string;
  yAxis?: string;
  onAxisChange: (axis: "x" | "y", column: string) => void;
}

const chartTypes: { value: ChartType; label: string; icon: typeof BarChart3 }[] = [
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "line", label: "Line Chart", icon: LineChart },
  { value: "area", label: "Area Chart", icon: TrendingUp },
  { value: "pie", label: "Pie Chart", icon: PieChart },
  { value: "donut", label: "Donut Chart", icon: PieChart },
  { value: "table", label: "Data Table", icon: Table2 },
  { value: "metric", label: "Metric Card", icon: Hash },
];

const paletteNames = Object.keys(colorPalettes) as (keyof typeof colorPalettes)[];

export function VisualizationConfig({
  chartType,
  onChartTypeChange,
  colors,
  onColorsChange,
  formatting,
  onFormattingChange,
  columns,
  xAxis,
  yAxis,
  onAxisChange,
}: VisualizationConfigProps) {
  const handlePaletteChange = (paletteName: string) => {
    const palette = colorPalettes[paletteName as keyof typeof colorPalettes];
    onColorsChange({
      primary: palette[0],
      palette,
    });
  };

  const numericColumns = columns.filter(c => c.type === "number");
  const categoricalColumns = columns.filter(c => c.type === "string" || c.type === "date");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Chart Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {chartTypes.map((type) => (
              <Button
                key={type.value}
                variant={chartType === type.value ? "default" : "outline"}
                size="sm"
                className="flex flex-col h-auto py-2 gap-1"
                onClick={() => onChartTypeChange(type.value)}
                data-testid={`button-chart-${type.value}`}
              >
                <type.icon className="h-4 w-4" />
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {chartType !== "table" && chartType !== "metric" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Axes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="x-axis">X-Axis (Category)</Label>
              <Select value={xAxis || ""} onValueChange={(v) => onAxisChange("x", v)}>
                <SelectTrigger id="x-axis" data-testid="select-x-axis">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {categoricalColumns.filter(col => col.name).map((col) => (
                    <SelectItem key={col.name} value={col.name}>
                      {col.displayName || col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="y-axis">Y-Axis (Value)</Label>
              <Select value={yAxis || ""} onValueChange={(v) => onAxisChange("y", v)}>
                <SelectTrigger id="y-axis" data-testid="select-y-axis">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {numericColumns.filter(col => col.name).map((col) => (
                    <SelectItem key={col.name} value={col.name}>
                      {col.displayName || col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Color Palette</Label>
            <Select
              value={paletteNames.find(name =>
                JSON.stringify(colorPalettes[name]) === JSON.stringify(colors.palette)
              ) || "default"}
              onValueChange={handlePaletteChange}
            >
              <SelectTrigger data-testid="select-color-palette">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paletteNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {colorPalettes[name].slice(0, 5).map((color, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 -ml-0.5 first:ml-0 rounded-full border border-background"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="capitalize">{name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primary-color"
                type="color"
                value={colors.primary}
                onChange={(e) => onColorsChange({ ...colors, primary: e.target.value })}
                className="w-12 h-9 p-1 cursor-pointer"
                data-testid="input-primary-color"
              />
              <Input
                value={colors.primary}
                onChange={(e) => onColorsChange({ ...colors, primary: e.target.value })}
                className="flex-1 font-mono"
                data-testid="input-primary-color-hex"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Formatting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Number Format</Label>
            <Select
              value={formatting.numberFormat || "number"}
              onValueChange={(v) => onFormattingChange({ ...formatting, numberFormat: v as "number" | "currency" | "percent" })}
            >
              <SelectTrigger data-testid="select-number-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="percent">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formatting.numberFormat === "currency" && (
            <div className="space-y-2">
              <Label htmlFor="currency-symbol">Currency Symbol</Label>
              <Input
                id="currency-symbol"
                value={formatting.currencySymbol || "$"}
                onChange={(e) => onFormattingChange({ ...formatting, currencySymbol: e.target.value })}
                className="w-20"
                data-testid="input-currency-symbol"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="decimals">Decimal Places</Label>
            <Select
              value={String(formatting.decimals ?? 0)}
              onValueChange={(v) => onFormattingChange({ ...formatting, decimals: parseInt(v) })}
            >
              <SelectTrigger data-testid="select-decimals">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} decimals
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-legend">Show Legend</Label>
            <Switch
              id="show-legend"
              checked={formatting.showLegend !== false}
              onCheckedChange={(checked) => onFormattingChange({ ...formatting, showLegend: checked })}
              data-testid="switch-show-legend"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-grid">Show Grid</Label>
            <Switch
              id="show-grid"
              checked={formatting.showGrid !== false}
              onCheckedChange={(checked) => onFormattingChange({ ...formatting, showGrid: checked })}
              data-testid="switch-show-grid"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-labels">Show Labels</Label>
            <Switch
              id="show-labels"
              checked={formatting.showLabels !== false}
              onCheckedChange={(checked) => onFormattingChange({ ...formatting, showLabels: checked })}
              data-testid="switch-show-labels"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
