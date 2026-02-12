import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Database,
  Code,
  Info
} from "lucide-react";
import type { Dataset } from "@/lib/bi-types";

interface SqlEditorProps {
  datasets: Dataset[];
  onQueryChange: (sql: string) => void;
  onRunQuery: () => void;
  initialSql?: string;
  selectedDatasetId: string;
  onDatasetChange: (id: string) => void;
}

export function SqlEditor({ datasets, onQueryChange, onRunQuery, initialSql = "", selectedDatasetId, onDatasetChange }: SqlEditorProps) {
  const [sql, setSql] = useState(initialSql);


  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);

  const handleSqlChange = (value: string) => {
    setSql(value);
    onQueryChange(value);
  };

  const insertTemplate = (template: string) => {
    handleSqlChange(template);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Schema Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedDatasetId} onValueChange={onDatasetChange}>
            <SelectTrigger data-testid="select-sql-dataset">
              <SelectValue placeholder="Select dataset to view schema" />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((dataset) => (
                <SelectItem key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedDataset && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Table: <code className="bg-muted px-1 rounded">{selectedDataset.id}</code>
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedDataset.columns.map((col) => (
                  <Badge key={col.name} variant="secondary" className="text-xs">
                    {col.name}
                    <span className="text-muted-foreground ml-1">({col.type})</span>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate(
                    `SELECT * FROM "${selectedDataset.id}" LIMIT 100`
                  )}
                  data-testid="button-template-select-all"
                >
                  SELECT *
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate(
                    `SELECT ${selectedDataset.columns.slice(0, 3).map(c => c.name).join(", ")}\nFROM "${selectedDataset.id}"\nGROUP BY ${selectedDataset.columns.find(c => c.type === "string")?.name || selectedDataset.columns[0].name}`
                  )}
                  data-testid="button-template-grouped"
                >
                  Grouped Query
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Code className="h-4 w-4" />
            SQL Query
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="SELECT column1, SUM(column2) FROM dataset GROUP BY column1"
            value={sql}
            onChange={(e) => handleSqlChange(e.target.value)}
            className="font-mono text-sm min-h-[200px]"
            data-testid="textarea-sql-query"
          />
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Use dataset IDs as table names. SQL is parsed client-side for demo purposes.</span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onRunQuery} className="w-full" data-testid="button-run-sql">
        <Play className="h-4 w-4 mr-2" />
        Run SQL Query
      </Button>
    </div>
  );
}
