import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  X, 
  Play, 
  Database,
  Filter,
  LayoutGrid,
  ArrowUpDown
} from "lucide-react";
import type { 
  Dataset, 
  QueryColumn, 
  QueryFilter, 
  AggregationType,
  VisualQuery 
} from "@/lib/bi-types";

interface QueryBuilderProps {
  datasets: Dataset[];
  onQueryChange: (query: VisualQuery) => void;
  onRunQuery: () => void;
}

const aggregationOptions: { value: AggregationType; label: string }[] = [
  { value: "none", label: "No aggregation" },
  { value: "sum", label: "Sum" },
  { value: "count", label: "Count" },
  { value: "avg", label: "Average" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
];

const operatorOptions = [
  { value: "=", label: "equals" },
  { value: "!=", label: "not equals" },
  { value: ">", label: "greater than" },
  { value: "<", label: "less than" },
  { value: ">=", label: "greater or equal" },
  { value: "<=", label: "less or equal" },
  { value: "contains", label: "contains" },
];

export function QueryBuilder({ datasets, onQueryChange, onRunQuery }: QueryBuilderProps) {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [columns, setColumns] = useState<QueryColumn[]>([]);
  const [filters, setFilters] = useState<QueryFilter[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);

  const updateQuery = (
    newColumns?: QueryColumn[],
    newFilters?: QueryFilter[],
    newGroupBy?: string[]
  ) => {
    onQueryChange({
      datasetId: selectedDatasetId,
      columns: newColumns || columns,
      filters: newFilters || filters,
      groupBy: newGroupBy || groupBy,
    });
  };

  const handleDatasetChange = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    setColumns([]);
    setFilters([]);
    setGroupBy([]);
    onQueryChange({
      datasetId,
      columns: [],
      filters: [],
      groupBy: [],
    });
  };

  const addColumn = () => {
    if (!selectedDataset) return;
    const newColumns = [...columns, { column: selectedDataset.columns[0].name, aggregation: "none" as AggregationType }];
    setColumns(newColumns);
    updateQuery(newColumns);
  };

  const updateColumn = (index: number, field: keyof QueryColumn, value: string) => {
    const newColumns = [...columns];
    if (field === "aggregation") {
      newColumns[index] = { ...newColumns[index], aggregation: value as AggregationType };
    } else {
      newColumns[index] = { ...newColumns[index], [field]: value };
    }
    setColumns(newColumns);
    updateQuery(newColumns);
  };

  const removeColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);
    updateQuery(newColumns);
  };

  const addFilter = () => {
    if (!selectedDataset) return;
    const newFilters = [...filters, { column: selectedDataset.columns[0].name, operator: "=" as const, value: "" }];
    setFilters(newFilters);
    updateQuery(undefined, newFilters);
  };

  const updateFilter = (index: number, field: keyof QueryFilter, value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
    updateQuery(undefined, newFilters);
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
    updateQuery(undefined, newFilters);
  };

  const toggleGroupBy = (columnName: string) => {
    const newGroupBy = groupBy.includes(columnName)
      ? groupBy.filter(c => c !== columnName)
      : [...groupBy, columnName];
    setGroupBy(newGroupBy);
    updateQuery(undefined, undefined, newGroupBy);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedDatasetId} onValueChange={handleDatasetChange}>
            <SelectTrigger data-testid="select-dataset">
              <SelectValue placeholder="Select a dataset" />
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
            <p className="text-xs text-muted-foreground mt-2">
              {selectedDataset.rowCount} rows, {selectedDataset.columns.length} columns
            </p>
          )}
        </CardContent>
      </Card>

      {selectedDataset && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Columns
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addColumn} data-testid="button-add-column">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {columns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No columns selected. Add columns to include in your query.</p>
              ) : (
                columns.map((col, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={col.column}
                      onValueChange={(value) => updateColumn(index, "column", value)}
                    >
                      <SelectTrigger className="flex-1" data-testid={`select-column-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDataset.columns.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.displayName || c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={col.aggregation}
                      onValueChange={(value) => updateColumn(index, "aggregation", value)}
                    >
                      <SelectTrigger className="w-[140px]" data-testid={`select-aggregation-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aggregationOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeColumn(index)}
                      data-testid={`button-remove-column-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addFilter} data-testid="button-add-filter">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filters.length === 0 ? (
                <p className="text-sm text-muted-foreground">No filters applied. Add filters to narrow your results.</p>
              ) : (
                filters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={filter.column}
                      onValueChange={(value) => updateFilter(index, "column", value)}
                    >
                      <SelectTrigger className="w-[140px]" data-testid={`select-filter-column-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDataset.columns.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.displayName || c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filter.operator}
                      onValueChange={(value) => updateFilter(index, "operator", value)}
                    >
                      <SelectTrigger className="w-[130px]" data-testid={`select-filter-operator-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operatorOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      value={String(filter.value)}
                      onChange={(e) => updateFilter(index, "value", e.target.value)}
                      className="flex-1"
                      data-testid={`input-filter-value-${index}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFilter(index)}
                      data-testid={`button-remove-filter-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Group By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedDataset.columns
                  .filter(c => c.type === "string")
                  .map((col) => (
                    <Badge
                      key={col.name}
                      variant={groupBy.includes(col.name) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleGroupBy(col.name)}
                      data-testid={`badge-groupby-${col.name}`}
                    >
                      {col.displayName || col.name}
                    </Badge>
                  ))}
              </div>
              {groupBy.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Grouping by: {groupBy.join(", ")}
                </p>
              )}
            </CardContent>
          </Card>

          <Button onClick={onRunQuery} className="w-full" data-testid="button-run-query">
            <Play className="h-4 w-4 mr-2" />
            Run Query
          </Button>
        </>
      )}
    </div>
  );
}
