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
import { useTranslation } from "react-i18next";

interface QueryBuilderProps {
  datasets: Dataset[];
  onQueryChange: (query: VisualQuery) => void;
  onRunQuery: () => void;
  query: VisualQuery;
}

export function QueryBuilder({ datasets, onQueryChange, onRunQuery, query }: QueryBuilderProps) {
  const { datasetId: selectedDatasetId, columns: rawColumns, filters, groupBy } = query;
  const { t } = useTranslation();

  const aggregationOptions = [
    { value: "none", label: t("bi.agg_none", { defaultValue: "No aggregation" }) },
    { value: "sum", label: t("bi.agg_sum", { defaultValue: "Sum" }) },
    { value: "count", label: t("bi.agg_count", { defaultValue: "Count" }) },
    { value: "avg", label: t("bi.agg_avg", { defaultValue: "Average" }) },
    { value: "min", label: t("bi.agg_min", { defaultValue: "Minimum" }) },
    { value: "max", label: t("bi.agg_max", { defaultValue: "Maximum" }) },
  ];

  const operatorOptions = [
    { value: "=", label: t("bi.op_equals", { defaultValue: "equals" }) },
    { value: "!=", label: t("bi.op_not_equals", { defaultValue: "not equals" }) },
    { value: ">", label: t("bi.op_greater_than", { defaultValue: "greater than" }) },
    { value: "<", label: t("bi.op_less_than", { defaultValue: "less than" }) },
    { value: ">=", label: t("bi.op_greater_equal", { defaultValue: "greater or equal" }) },
    { value: "<=", label: t("bi.op_less_equal", { defaultValue: "less or equal" }) },
    { value: "contains", label: t("bi.op_contains", { defaultValue: "contains" }) },
  ];

  // Ensure columns is treated as QueryColumn[]
  const columns = (rawColumns as QueryColumn[]) || [];

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
      aggregation: query.aggregation,
    });
  };

  const handleDatasetChange = (datasetId: string) => {
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
    updateQuery(newColumns);
  };

  const updateColumn = (index: number, field: keyof QueryColumn, value: string) => {
    const newColumns = [...columns];
    if (field === "aggregation") {
      newColumns[index] = { ...newColumns[index], aggregation: value as AggregationType };
    } else {
      newColumns[index] = { ...newColumns[index], [field]: value };
    }
    updateQuery(newColumns);
  };

  const removeColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index);
    updateQuery(newColumns);
  };

  const addFilter = () => {
    if (!selectedDataset) return;
    const newFilters = [...filters, { column: selectedDataset.columns[0].name, operator: "=" as const, value: "" }];
    updateQuery(undefined, newFilters);
  };

  const updateFilter = (index: number, field: keyof QueryFilter, value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    updateQuery(undefined, newFilters);
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    updateQuery(undefined, newFilters);
  };

  const toggleGroupBy = (columnName: string) => {
    const newGroupBy = groupBy.includes(columnName)
      ? groupBy.filter(c => c !== columnName)
      : [...groupBy, columnName];
    updateQuery(undefined, undefined, newGroupBy);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            {t("bi.data_source")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedDatasetId} onValueChange={handleDatasetChange}>
            <SelectTrigger data-testid="select-dataset">
              <SelectValue placeholder={t("bi.select_dataset")} />
            </SelectTrigger>
            <SelectContent>
              {datasets.filter(d => d.id).map((dataset) => (
                <SelectItem key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDataset && (
            <p className="text-xs text-muted-foreground mt-2">
              {selectedDataset.rowCount} {t("bi.rows")} {selectedDataset.columns.length} {t("bi.columns")}
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
                  {t("bi.columns")}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addColumn} data-testid="button-add-column">
                  <Plus className="h-3 w-3 mr-1" />
                  {t("bi.add_column")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {columns.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("bi.no_columns_selected")}</p>
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
                        {selectedDataset.columns.filter(c => c.name).map((c) => (
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
                  {t("bi.filters")}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addFilter} data-testid="button-add-filter">
                  <Plus className="h-3 w-3 mr-1" />
                  {t("bi.add_filter")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filters.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("bi.no_filters_applied")}</p>
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
                        {selectedDataset.columns.filter(c => c.name).map((c) => (
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
                {t("bi.group_by")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedDataset.columns
                  .filter(c => c.type === "string" || c.type === "number" || c.type === "date")
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
                  {t("bi.grouping_by")} {groupBy.join(", ")}
                </p>
              )}
            </CardContent>
          </Card>

          <Button onClick={onRunQuery} className="w-full" data-testid="button-run-query">
            <Play className="h-4 w-4 mr-2" />
            {t("bi.run_query")}
          </Button>
        </>
      )}
    </div>
  );
}
