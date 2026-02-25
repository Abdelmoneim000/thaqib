import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  MousePointer,
  Loader2,
  FolderKanban,
  LayoutDashboard,
  Type,
  Plus
} from "lucide-react";
import { CreateDashboardDialog } from "@/components/bi/create-dashboard-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import { QueryBuilder } from "@/components/bi/query-builder";
import { SqlEditor } from "@/components/bi/sql-editor";
import { VisualizationConfig } from "@/components/bi/visualization-config";
import { ChartRenderer } from "@/components/bi/chart-renderer";
import { colorPalettes } from "@/lib/bi-types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type {
  ChartType,
  ChartColors,
  ChartFormatting,
  DataColumn,
  Dataset,
  VisualQuery
} from "@/lib/bi-types";

export default function VisualizationBuilderPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [vizName, setVizName] = useState("New Visualization");
  const [queryMode, setQueryMode] = useState<"visual" | "sql" | "text">("visual"); // Added text mode

  const [textContent, setTextContent] = useState(""); // For text block content
  const [textEditMode, setTextEditMode] = useState<"write" | "preview">("write");

  const [visualQuery, setVisualQuery] = useState<VisualQuery>({
    datasetId: "",
    columns: [],
    filters: [],
    groupBy: [],
  });
  const [sqlQuery, setSqlQuery] = useState("");

  const [chartType, setChartType] = useState<ChartType>("bar");
  const [colors, setColors] = useState<ChartColors>({
    primary: colorPalettes.default[0],
    palette: colorPalettes.default,
  });
  const [formatting, setFormatting] = useState<ChartFormatting>({
    numberFormat: "number",
    decimals: 0,
    showLegend: true,
    showGrid: true,
    showLabels: true,
  });
  const [xAxis, setXAxis] = useState<string>("");
  const [yAxis, setYAxis] = useState<string>("");

  const [queryResults, setQueryResults] = useState<Record<string, unknown>[]>([]);
  const [hasRun, setHasRun] = useState(false);

  // Parse query params
  const searchParams = new URLSearchParams(window.location.search);
  const initialDashboardId = searchParams.get("dashboardId") || "";
  const initialProjectId = searchParams.get("projectId") || "";

  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>(initialDashboardId);
  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const { data: dashboards = [] } = useQuery<any[]>({
    queryKey: selectedProjectId && selectedProjectId !== "personal"
      ? [`/api/dashboards?projectId=${selectedProjectId}`]
      : ["/api/dashboards"],
    // Always enabled, if simple fetch we filter client side
  });

  // Filter dashboards based on selection
  const filteredDashboards = useMemo(() => {
    if (!dashboards) return [];
    if (selectedProjectId === "personal") {
      return dashboards.filter(d => !d.projectId);
    }
    if (selectedProjectId) {
      return dashboards.filter(d => d.projectId === selectedProjectId);
    }
    return [];
  }, [dashboards, selectedProjectId]);



  const { data: datasets = [], isLoading: datasetsLoading } = useQuery<Dataset[]>({
    queryKey: selectedProjectId && selectedProjectId !== "personal"
      ? [`/api/datasets?projectId=${selectedProjectId}`]
      : ["/api/datasets"], // Use default endpoint which should return user datasets
  });

  // Filter datasets based on selection (if API returns mixed)
  const filteredDatasets = useMemo(() => {
    if (!datasets) return [];
    if (selectedProjectId === "personal") {
      return datasets.filter(d => !d.projectId);
    }
    if (selectedProjectId) {
      return datasets.filter(d => d.projectId === selectedProjectId);
    }
    return [];
  }, [datasets, selectedProjectId]);

  const convertedDatasets: Dataset[] = useMemo(() => {
    return filteredDatasets.map(d => ({
      id: d.id,
      name: d.name,
      columns: d.columns
        .filter(c => c.name && c.name.trim() !== "")
        .map(c => ({
          name: c.name,
          type: c.type,
          displayName: c.name,
        })),
      data: [],
    }));
  }, [filteredDatasets]);

  const selectedDataset = convertedDatasets.find(d => d.id === visualQuery.datasetId);
  const columns: DataColumn[] = selectedDataset?.columns || [];

  const queryMutation = useMutation({
    mutationFn: async (params: { datasetId: string; query: any }) => {
      const res = await apiRequest("POST", "/api/query", params);
      return res.json();
    },
    onSuccess: (data) => {
      setQueryResults(data.data);
      setHasRun(true);

      // Warn if results were truncated
      if (data.truncated) {
        toast({
          title: `Showing ${data.rowCount.toLocaleString()} of ${data.totalRowCount.toLocaleString()} rows`,
          description: "Results were capped. Apply filters or GROUP BY to reduce data.",
        });
      }

      if (data.data.length > 0 && !xAxis && !yAxis) {
        const keys = Object.keys(data.data[0]);
        const numericKey = keys.find(k => typeof data.data[0][k] === "number");
        const stringKey = keys.find(k => typeof data.data[0][k] === "string");
        if (stringKey) setXAxis(stringKey);
        if (numericKey) setYAxis(numericKey);
      }
    },
    onError: () => {
      toast({ title: "Query failed", description: "Could not execute query", variant: "destructive" });
    }
  });

  const runQuery = () => {
    if (!visualQuery.datasetId) {
      toast({ title: "Select a dataset", description: "Please select a dataset to query", variant: "destructive" });
      return;
    }

    const columnDefs = Array.isArray(visualQuery.columns) ? visualQuery.columns : [];
    const columnNames = columnDefs.map(c => typeof c === 'string' ? c : c.column);

    // Build aggregation from the column definitions that have a non-'none' aggregation
    // The server expects { column, function } for a single aggregation target
    let aggregation = visualQuery.aggregation;
    if (!aggregation) {
      const aggColumn = columnDefs.find(
        c => typeof c !== 'string' && c.aggregation && c.aggregation !== 'none'
      );
      if (aggColumn && typeof aggColumn !== 'string') {
        aggregation = {
          column: aggColumn.column,
          function: aggColumn.aggregation as "sum" | "avg" | "count" | "min" | "max",
        };
      }
    }

    const query = queryMode === "visual"
      ? {
        type: "visual",
        columns: columnNames,
        filters: visualQuery.filters,
        groupBy: visualQuery.groupBy?.[0],
        aggregation,
      }
      : { type: "sql", sql: sqlQuery };

    queryMutation.mutate({ datasetId: visualQuery.datasetId, query });
  };

  const saveMutation = useMutation({
    mutationFn: async (vizData: any) => {
      const res = await apiRequest("POST", "/api/visualizations", vizData);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved!", description: "Visualization saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/visualizations"] });
      navigate("/analyst/dashboards");
    },
    onError: () => {
      toast({ title: "Save failed", description: "Could not save visualization", variant: "destructive" });
    }
  });

  const handleAxisChange = (axis: "x" | "y", column: string) => {
    if (axis === "x") setXAxis(column);
    else setYAxis(column);
  };

  const handleSave = () => {
    if (!selectedDashboardId) {
      toast({ title: "Select a dashboard", description: "Please select a dashboard to save the visualization to", variant: "destructive" });
      return;
    }

    // Build aggregation from column definitions (same logic as runQuery)
    const columnDefs = Array.isArray(visualQuery.columns) ? visualQuery.columns : [];
    const columnNames = columnDefs.map(c => typeof c === 'string' ? c : c.column);
    let aggregation = visualQuery.aggregation;
    if (!aggregation) {
      const aggColumn = columnDefs.find(
        c => typeof c !== 'string' && c.aggregation && c.aggregation !== 'none'
      );
      if (aggColumn && typeof aggColumn !== 'string') {
        aggregation = {
          column: aggColumn.column,
          function: aggColumn.aggregation as "sum" | "avg" | "count" | "min" | "max",
        };
      }
    }

    saveMutation.mutate({
      name: vizName,
      datasetId: visualQuery.datasetId,
      chartType: chartType,
      query: queryMode === "visual"
        ? { type: "visual", columns: columnNames, filters: visualQuery.filters, groupBy: visualQuery.groupBy?.[0], aggregation }
        : queryMode === "sql"
          ? { type: "sql", sql: sqlQuery }
          : { type: "text", text: textContent },
      config: { xAxis, yAxis, categoryField: xAxis, valueField: yAxis, colors, formatting, description: textContent },
      dashboardId: selectedDashboardId,
    });
  };

  const resultColumns: DataColumn[] = useMemo(() => {
    if (queryResults.length === 0) return columns;
    const firstRow = queryResults[0];
    return Object.keys(firstRow).map(key => ({
      name: key,
      type: typeof firstRow[key] === "number" ? "number" : "string",
      displayName: key,
    }));
  }, [queryResults, columns]);

  if (datasetsLoading) {
    return (
      <AnalystLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AnalystLayout>
    );
  }

  return (
    <AnalystLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Link href="/analyst/dashboards">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <Input
                value={vizName}
                onChange={(e) => setVizName(e.target.value)}
                className="text-xl font-semibold border-none p-0 h-auto focus-visible:ring-0 w-[300px]"
                data-testid="input-viz-name"
              />
              <p className="text-sm text-muted-foreground">Create a new visualization</p>
            </div>

          </div>

          <div className="w-full md:w-[250px]">
            <Select
              value={selectedProjectId}
              onValueChange={(val) => {
                setSelectedProjectId(val);
                setSelectedDashboardId("");
                // Reset dataset selection when project changes
                setVisualQuery(prev => ({ ...prev, datasetId: "" }));
              }}
            >
              <SelectTrigger>
                <FolderKanban className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select Context" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Personal Library</span>
                  </div>
                </SelectItem>
                {projects.filter(p => p.id).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-[250px] flex gap-2">
            <Select
              value={selectedDashboardId}
              onValueChange={setSelectedDashboardId}
              disabled={!selectedProjectId}
            >
              <SelectTrigger className="flex-1">
                <LayoutDashboard className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select Dashboard" />
              </SelectTrigger>
              <SelectContent>
                {filteredDashboards.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateDashboardDialog
              open={isCreateDashboardOpen}
              onOpenChange={setIsCreateDashboardOpen}
              projectId={selectedProjectId}
              onSuccess={(id) => setSelectedDashboardId(id)}
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  title="Create New Dashboard"
                  disabled={!selectedProjectId}
                  onClick={() => setIsCreateDashboardOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              }
            />
          </div>

          <div className="flex gap-2 self-end lg:self-auto">
            <Button
              variant="outline"
              onClick={runQuery}
              disabled={queryMutation.isPending}
              data-testid="button-preview"
            >
              {queryMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              data-testid="button-save-viz"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div >

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <Tabs value={queryMode} onValueChange={(v) => setQueryMode(v as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="visual" className="flex-1" data-testid="tab-visual-query">
                  <MousePointer className="h-4 w-4 mr-2" />
                  Visual
                </TabsTrigger>
                <TabsTrigger value="sql" className="flex-1" data-testid="tab-sql-query">
                  <Code className="h-4 w-4 mr-2" />
                  SQL
                </TabsTrigger>
              </TabsList>
              <TabsContent value="visual" className="mt-4">
                <QueryBuilder
                  datasets={convertedDatasets}
                  query={visualQuery}
                  onQueryChange={setVisualQuery}
                  onRunQuery={runQuery}
                />
              </TabsContent>
              <TabsContent value="sql" className="mt-4">
                <SqlEditor
                  datasets={convertedDatasets}
                  onQueryChange={setSqlQuery}
                  onRunQuery={runQuery}
                  initialSql={sqlQuery}
                  selectedDatasetId={visualQuery.datasetId}
                  onDatasetChange={(id) => setVisualQuery({
                    datasetId: id,
                    columns: [],
                    filters: [],
                    groupBy: [],
                  })}
                />
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Description (Markdown)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter description, context, or guides in Markdown..."
                    value={textContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextContent(e.target.value)}
                    className="min-h-[150px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports **bold**, *italic*, - lists, # headings
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {!hasRun ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No Data Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure your query and click Preview to see results
                    </p>
                  </div>
                ) : queryResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-muted-foreground">No results found</p>
                  </div>
                ) : (
                  <ChartRenderer
                    type={chartType}
                    data={queryResults}
                    xAxis={xAxis}
                    yAxis={yAxis}
                    categoryField={xAxis}
                    valueField={yAxis}
                    colors={colors}
                    formatting={formatting}
                  />
                )}
              </CardContent>
            </Card>

            {textContent && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Description Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{textContent}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasRun && queryResults.length > 0 && (
              <VisualizationConfig
                chartType={chartType}
                onChartTypeChange={setChartType}
                colors={colors}
                onColorsChange={setColors}
                formatting={formatting}
                onFormattingChange={setFormatting}
                columns={resultColumns}
                xAxis={xAxis}
                yAxis={yAxis}
                onAxisChange={handleAxisChange}
              />
            )}
          </div>
        </div>
      </div >
    </AnalystLayout >
  );
}
