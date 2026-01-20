// BI Data Types for DataWork Analytics

export type ColumnType = "string" | "number" | "date" | "boolean";

export interface DataColumn {
  name: string;
  type: ColumnType | string;
  displayName?: string;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  columns: DataColumn[];
  data?: Record<string, unknown>[];
  rowCount?: number;
  uploadedAt?: string;
}

export type AggregationType = "sum" | "count" | "avg" | "min" | "max" | "none";

export interface QueryFilter {
  column: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "startsWith" | "endsWith" | "equals" | "not_equals" | "greater_than" | "less_than" | "between";
  value: string | number;
  value2?: string | number;
}

export interface QueryColumn {
  column: string;
  aggregation: AggregationType;
  alias?: string;
}

export interface VisualQuery {
  datasetId: string;
  columns: QueryColumn[] | string[];
  filters: QueryFilter[];
  groupBy: string[];
  aggregation?: {
    column: string;
    function: "sum" | "avg" | "count" | "min" | "max";
  };
  orderBy?: { column: string; direction: "asc" | "desc" };
  limit?: number;
}

export type ChartType = "bar" | "line" | "pie" | "donut" | "table" | "metric" | "area";

export interface ChartColors {
  primary: string;
  palette: string[];
}

export interface ChartFormatting {
  numberFormat?: "number" | "currency" | "percent";
  decimals?: number;
  currencySymbol?: string;
  showLegend?: boolean;
  legendPosition?: "top" | "bottom" | "left" | "right";
  showGrid?: boolean;
  showLabels?: boolean;
}

export interface Visualization {
  id: string;
  name: string;
  type: ChartType;
  query: VisualQuery | string;
  queryMode: "visual" | "sql";
  colors: ChartColors;
  formatting: ChartFormatting;
  xAxis?: string;
  yAxis?: string;
  categoryField?: string;
  valueField?: string;
}

export interface DashboardItem {
  id: string;
  visualizationId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  items: DashboardItem[];
  createdAt?: string;
  updatedAt?: string;
}

export const colorPalettes = {
  default: ["#0f62fe", "#6929c4", "#1192e8", "#005d5d", "#9f1853", "#fa4d56", "#570408", "#198038"],
  warm: ["#da1e28", "#ff832b", "#f1c21b", "#24a148", "#0072c3", "#6929c4"],
  cool: ["#0043ce", "#4589ff", "#0072c3", "#1192e8", "#00539a", "#003a6d"],
  earth: ["#198038", "#24a148", "#42be65", "#6fdc8c", "#a7f0ba", "#defbe6"],
  sunset: ["#750e13", "#a2191f", "#da1e28", "#fa4d56", "#ff8389", "#ffb3b8"],
};

export const sampleDatasets: Dataset[] = [
  {
    id: "sales-2024",
    name: "Sales Data 2024",
    description: "Monthly sales performance data",
    columns: [
      { name: "month", type: "string", displayName: "Month" },
      { name: "region", type: "string", displayName: "Region" },
      { name: "product", type: "string", displayName: "Product" },
      { name: "revenue", type: "number", displayName: "Revenue" },
      { name: "units", type: "number", displayName: "Units Sold" },
      { name: "profit", type: "number", displayName: "Profit" },
    ],
    data: [
      { month: "Jan", region: "North", product: "Widget A", revenue: 45000, units: 150, profit: 12000 },
      { month: "Jan", region: "South", product: "Widget A", revenue: 38000, units: 120, profit: 9500 },
      { month: "Jan", region: "East", product: "Widget B", revenue: 52000, units: 180, profit: 15000 },
      { month: "Jan", region: "West", product: "Widget B", revenue: 41000, units: 140, profit: 11000 },
      { month: "Feb", region: "North", product: "Widget A", revenue: 48000, units: 160, profit: 13000 },
      { month: "Feb", region: "South", product: "Widget A", revenue: 42000, units: 135, profit: 10500 },
      { month: "Feb", region: "East", product: "Widget B", revenue: 55000, units: 190, profit: 16000 },
      { month: "Feb", region: "West", product: "Widget B", revenue: 44000, units: 150, profit: 12000 },
      { month: "Mar", region: "North", product: "Widget A", revenue: 51000, units: 170, profit: 14000 },
      { month: "Mar", region: "South", product: "Widget A", revenue: 45000, units: 145, profit: 11500 },
      { month: "Mar", region: "East", product: "Widget B", revenue: 58000, units: 200, profit: 17000 },
      { month: "Mar", region: "West", product: "Widget B", revenue: 47000, units: 160, profit: 13000 },
      { month: "Apr", region: "North", product: "Widget A", revenue: 53000, units: 175, profit: 14500 },
      { month: "Apr", region: "South", product: "Widget A", revenue: 46000, units: 150, profit: 12000 },
      { month: "Apr", region: "East", product: "Widget B", revenue: 61000, units: 210, profit: 18000 },
      { month: "Apr", region: "West", product: "Widget B", revenue: 49000, units: 165, profit: 13500 },
    ],
    rowCount: 16,
    uploadedAt: "2024-01-15",
  },
  {
    id: "customers",
    name: "Customer Analytics",
    description: "Customer behavior and demographics",
    columns: [
      { name: "segment", type: "string", displayName: "Segment" },
      { name: "age_group", type: "string", displayName: "Age Group" },
      { name: "customers", type: "number", displayName: "Customer Count" },
      { name: "avg_order_value", type: "number", displayName: "Avg Order Value" },
      { name: "retention_rate", type: "number", displayName: "Retention Rate" },
    ],
    data: [
      { segment: "Enterprise", age_group: "25-34", customers: 450, avg_order_value: 2500, retention_rate: 0.85 },
      { segment: "Enterprise", age_group: "35-44", customers: 680, avg_order_value: 3200, retention_rate: 0.88 },
      { segment: "Enterprise", age_group: "45-54", customers: 520, avg_order_value: 2800, retention_rate: 0.82 },
      { segment: "SMB", age_group: "25-34", customers: 1200, avg_order_value: 450, retention_rate: 0.72 },
      { segment: "SMB", age_group: "35-44", customers: 1800, avg_order_value: 520, retention_rate: 0.75 },
      { segment: "SMB", age_group: "45-54", customers: 1100, avg_order_value: 480, retention_rate: 0.70 },
      { segment: "Consumer", age_group: "18-24", customers: 3200, avg_order_value: 85, retention_rate: 0.45 },
      { segment: "Consumer", age_group: "25-34", customers: 4500, avg_order_value: 120, retention_rate: 0.55 },
      { segment: "Consumer", age_group: "35-44", customers: 2800, avg_order_value: 150, retention_rate: 0.62 },
      { segment: "Consumer", age_group: "45-54", customers: 1500, avg_order_value: 130, retention_rate: 0.58 },
    ],
    rowCount: 10,
    uploadedAt: "2024-01-20",
  },
];
