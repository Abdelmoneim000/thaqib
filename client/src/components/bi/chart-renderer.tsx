import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartType, ChartColors, ChartFormatting } from "@/lib/bi-types";
import { colorPalettes } from "@/lib/bi-types";
import ReactMarkdown from "react-markdown";

interface ChartRendererProps {
  type: ChartType;
  data: Record<string, unknown>[];
  xAxis?: string;
  yAxis?: string;
  categoryField?: string;
  valueField?: string;
  title?: string;
  colors?: ChartColors;
  formatting?: ChartFormatting;
  textContent?: string;
}

function formatValue(value: number, formatting?: ChartFormatting): string {
  if (!formatting) return value.toLocaleString();

  const decimals = formatting.decimals ?? 0;

  switch (formatting.numberFormat) {
    case "currency":
      return `${formatting.currencySymbol || "$"}${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    case "percent":
      return `${(value * 100).toFixed(decimals)}%`;
    default:
      return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
}

function formatLabel(value: string | number): string {
  if (typeof value === 'number') return value.toLocaleString();
  if (!value) return '';
  const str = String(value);
  // Truncate long labels for chart readability
  if (str.length > 20) return str.slice(0, 18) + '…';
  return str;
}

// Only used when the column name contains "date"
function formatDateLabel(value: string | number): string {
  if (typeof value === 'number') return value.toLocaleString();
  if (!value) return '';
  const str = String(value);
  // Try to parse as date
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return str;
}

export function ChartRenderer({
  type,
  data,
  xAxis,
  yAxis,
  categoryField,
  valueField,
  title,
  colors,
  formatting,
  textContent,
}: ChartRendererProps) {
  const palette = colors?.palette || colorPalettes.default;
  const primaryColor = colors?.primary || palette[0];
  const showLegend = formatting?.showLegend ?? true;
  const showGrid = formatting?.showGrid ?? true;
  const legendPosition = formatting?.legendPosition || "bottom";

  const renderChart = () => {
    // Only format as dates when the column name contains "date"
    const xCol = (xAxis || categoryField || '').toLowerCase();
    const labelFmt = xCol.includes('date') ? formatDateLabel : formatLabel;

    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
              <XAxis
                dataKey={xAxis || categoryField}
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'currentColor' }}
                tickFormatter={labelFmt}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => formatValue(value, formatting)}
              />
              <Tooltip
                formatter={(value: number) => formatValue(value, formatting)}
                labelFormatter={labelFmt}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              {showLegend && <Legend />}
              <Bar dataKey={yAxis || valueField || "value"} fill={primaryColor} radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
              <XAxis
                dataKey={xAxis || categoryField}
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'currentColor' }}
                tickFormatter={formatLabel}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => formatValue(value, formatting)}
              />
              <Tooltip
                formatter={(value: number) => formatValue(value, formatting)}
                labelFormatter={labelFmt}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey={yAxis || valueField || "value"}
                stroke={primaryColor}
                strokeWidth={2}
                dot={{ fill: primaryColor, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
              <XAxis
                dataKey={xAxis || categoryField}
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'currentColor' }}
                tickFormatter={formatLabel}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => formatValue(value, formatting)}
              />
              <Tooltip
                formatter={(value: number) => formatValue(value, formatting)}
                labelFormatter={labelFmt}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              {showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey={yAxis || valueField || "value"}
                stroke={primaryColor}
                fill={primaryColor}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
      case "donut":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={type === "donut" ? 60 : 0}
                outerRadius={100}
                paddingAngle={2}
                dataKey={valueField || "value"}
                nameKey={categoryField || "name"}
                label={formatting?.showLabels !== false}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatValue(value, formatting)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case "metric":
        const value = data[0]?.[valueField || "value"] as number || 0;
        const label = data[0]?.[categoryField || "label"] as string || "Value";
        return (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="text-4xl font-bold" style={{ color: primaryColor }}>
              {formatValue(value, formatting)}
            </div>
            <div className="text-muted-foreground mt-2">{label}</div>
          </div>
        );

      case "table": {
        if (!data.length) return <div className="text-muted-foreground p-4">No data</div>;
        const columns = Object.keys(data[0]);
        const PAGE_SIZE = 100;
        const totalPages = Math.ceil(data.length / PAGE_SIZE);
        // Use a simple approach: slice data based on a page index stored in a data attribute
        // Since this is a pure render function, we'll show first page and let parent handle pagination
        // For now, just slice to PAGE_SIZE and show count
        const displayData = data.slice(0, PAGE_SIZE);
        return (
          <div>
            {data.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground border-b bg-muted/30">
                <span>Showing 1–{Math.min(PAGE_SIZE, data.length)} of {data.length.toLocaleString()} rows</span>
              </div>
            )}
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="text-left p-2 font-medium border-b">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-muted/50">
                      {columns.map((col) => (
                        <td key={col} className="p-2">
                          {typeof row[col] === "number"
                            ? formatValue(row[col] as number, formatting)
                            : col.toLowerCase().includes('date')
                              ? formatDateLabel(String(row[col]))
                              : formatLabel(String(row[col]))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case "text":
        // Prefer explicit textContent prop, then check data
        const content = textContent || (data[0]?.[valueField || "text"] as string) || (data[0]?.value as string) || "";
        return (
          <div className="p-4 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        );

      default:
        return <div className="text-muted-foreground p-4">Unknown chart type</div>;
    }
  };

  const chart = renderChart();

  if (title) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {textContent && type !== "text" ? (
            <div className="flex flex-col gap-4">
              <div>
                {chart}
              </div>
              <div className="p-2 prose prose-sm dark:prose-invert max-w-none border-t pt-4">
                <ReactMarkdown>{textContent}</ReactMarkdown>
              </div>
            </div>
          ) : chart}
        </CardContent>
      </Card>
    );
  }

  if (textContent && type !== "text") {
    return (
      <div className="flex flex-col gap-4">
        <div>
          {chart}
        </div>
        <div className="p-2 prose prose-sm dark:prose-invert max-w-none border-t pt-4">
          <ReactMarkdown>{textContent}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return chart;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  color = "#0f62fe",
  formatting,
}: {
  title: string;
  value: number;
  subtitle?: string;
  trend?: { value: number; label: string };
  color?: string;
  formatting?: ChartFormatting;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color }}>
          {formatValue(value, formatting)}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
