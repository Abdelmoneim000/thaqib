import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Save,
  Eye,
  Code,
  MousePointer
} from "lucide-react";
import { QueryBuilder } from "@/components/bi/query-builder";
import { SqlEditor } from "@/components/bi/sql-editor";
import { VisualizationConfig } from "@/components/bi/visualization-config";
import { ChartRenderer } from "@/components/bi/chart-renderer";
import { executeVisualQuery, executeSqlQuery } from "@/lib/query-executor";
import { sampleDatasets, colorPalettes } from "@/lib/bi-types";
import type { 
  VisualQuery, 
  ChartType, 
  ChartColors, 
  ChartFormatting,
  DataColumn 
} from "@/lib/bi-types";

export default function VisualizationBuilderPage() {
  const [, navigate] = useLocation();
  const [vizName, setVizName] = useState("New Visualization");
  const [queryMode, setQueryMode] = useState<"visual" | "sql">("visual");
  
  // Query state
  const [visualQuery, setVisualQuery] = useState<VisualQuery>({
    datasetId: "",
    columns: [],
    filters: [],
    groupBy: [],
  });
  const [sqlQuery, setSqlQuery] = useState("");
  
  // Chart configuration
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
  
  // Results
  const [queryResults, setQueryResults] = useState<Record<string, unknown>[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const selectedDataset = sampleDatasets.find(d => d.id === visualQuery.datasetId);
  const columns: DataColumn[] = selectedDataset?.columns || [];

  const runQuery = () => {
    let results: Record<string, unknown>[];
    
    if (queryMode === "visual") {
      results = executeVisualQuery(visualQuery, sampleDatasets);
    } else {
      results = executeSqlQuery(sqlQuery, sampleDatasets);
    }
    
    setQueryResults(results);
    setHasRun(true);

    // Auto-select axes if not set
    if (results.length > 0 && !xAxis && !yAxis) {
      const keys = Object.keys(results[0]);
      const numericKey = keys.find(k => typeof results[0][k] === "number");
      const stringKey = keys.find(k => typeof results[0][k] === "string");
      if (stringKey) setXAxis(stringKey);
      if (numericKey) setYAxis(numericKey);
    }
  };

  const handleAxisChange = (axis: "x" | "y", column: string) => {
    if (axis === "x") setXAxis(column);
    else setYAxis(column);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving visualization:", {
      name: vizName,
      queryMode,
      query: queryMode === "visual" ? visualQuery : sqlQuery,
      chartType,
      colors,
      formatting,
      xAxis,
      yAxis,
    });
    navigate("/analyst/dashboards");
  };

  // Derive columns from results for config
  const resultColumns: DataColumn[] = useMemo(() => {
    if (queryResults.length === 0) return columns;
    const firstRow = queryResults[0];
    return Object.keys(firstRow).map(key => ({
      name: key,
      type: typeof firstRow[key] === "number" ? "number" : "string",
      displayName: key,
    }));
  }, [queryResults, columns]);

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
              <Input
                value={vizName}
                onChange={(e) => setVizName(e.target.value)}
                className="text-xl font-semibold border-none p-0 h-auto focus-visible:ring-0"
                data-testid="input-viz-name"
              />
              <p className="text-sm text-muted-foreground">Create a new visualization</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={runQuery} data-testid="button-preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} data-testid="button-save-viz">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 space-y-4">
            <Tabs value={queryMode} onValueChange={(v) => setQueryMode(v as "visual" | "sql")}>
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
                  datasets={sampleDatasets}
                  onQueryChange={setVisualQuery}
                  onRunQuery={runQuery}
                />
              </TabsContent>
              <TabsContent value="sql" className="mt-4">
                <SqlEditor
                  datasets={sampleDatasets}
                  onQueryChange={setSqlQuery}
                  onRunQuery={runQuery}
                  initialSql={sqlQuery}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="col-span-8 space-y-4">
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
      </div>
    </AnalystLayout>
  );
}
