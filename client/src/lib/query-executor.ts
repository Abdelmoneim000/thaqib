import type { Dataset, VisualQuery, QueryFilter, AggregationType } from "./bi-types";

export function executeVisualQuery(
  query: VisualQuery,
  datasets: Dataset[]
): Record<string, unknown>[] {
  const dataset = datasets.find(d => d.id === query.datasetId);
  if (!dataset) return [];

  // Normalize columns to ensure they are QueryColumn objects
  const columns: { column: string; aggregation: AggregationType; alias?: string }[] =
    query.columns.map(c => typeof c === 'string' ? { column: c, aggregation: "none" as AggregationType } : c);

  let data = [...(dataset.data || [])];

  // Apply filters
  if (query.filters.length > 0) {
    data = data.filter(row => {
      return query.filters.every(filter => applyFilter(row, filter));
    });
  }

  // Apply grouping and aggregation
  if (query.groupBy.length > 0 && columns.some(c => c.aggregation !== "none")) {
    data = aggregateData(data, columns, query.groupBy);
  } else if (columns.length > 0) {
    // Just select columns
    data = data.map(row => {
      const newRow: Record<string, unknown> = {};
      columns.forEach(col => {
        const key = col.alias || col.column;
        newRow[key] = row[col.column];
      });
      return newRow;
    });
  }

  // Apply ordering
  if (query.orderBy) {
    data.sort((a, b) => {
      const aVal = a[query.orderBy!.column] as string | number;
      const bVal = b[query.orderBy!.column] as string | number;
      const direction = query.orderBy!.direction === "asc" ? 1 : -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * direction;
      }
      return String(aVal).localeCompare(String(bVal)) * direction;
    });
  }

  // Apply limit
  if (query.limit) {
    data = data.slice(0, query.limit);
  }

  return data;
}

function applyFilter(row: Record<string, unknown>, filter: QueryFilter): boolean {
  const value = row[filter.column];
  const filterValue = filter.value;

  switch (filter.operator) {
    case "=":
      return value == filterValue;
    case "!=":
      return value != filterValue;
    case ">":
      return Number(value) > Number(filterValue);
    case "<":
      return Number(value) < Number(filterValue);
    case ">=":
      return Number(value) >= Number(filterValue);
    case "<=":
      return Number(value) <= Number(filterValue);
    case "contains":
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case "startsWith":
      return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
    case "endsWith":
      return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
    default:
      return true;
  }
}

function aggregateData(
  data: Record<string, unknown>[],
  columns: { column: string; aggregation: AggregationType; alias?: string }[],
  groupBy: string[]
): Record<string, unknown>[] {
  // Group data
  const groups = new Map<string, Record<string, unknown>[]>();

  data.forEach(row => {
    const key = groupBy.map(col => String(row[col])).join("|");
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });

  // Aggregate each group
  const result: Record<string, unknown>[] = [];

  groups.forEach((rows) => {
    const aggregatedRow: Record<string, unknown> = {};

    // Add group by columns
    groupBy.forEach(col => {
      aggregatedRow[col] = rows[0][col];
    });

    // Add aggregated columns
    columns.forEach(col => {
      if (col.aggregation === "none") {
        aggregatedRow[col.alias || col.column] = rows[0][col.column];
      } else {
        const values = rows.map(r => Number(r[col.column])).filter(v => !isNaN(v));
        aggregatedRow[col.alias || col.column] = applyAggregation(values, col.aggregation);
      }
    });

    result.push(aggregatedRow);
  });

  return result;
}

function applyAggregation(values: number[], aggregation: AggregationType): number {
  if (values.length === 0) return 0;

  switch (aggregation) {
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "count":
      return values.length;
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    default:
      return values[0];
  }
}

export function executeSqlQuery(
  sql: string,
  datasets: Dataset[]
): Record<string, unknown>[] {
  // Simple SQL parser for demo - handles basic SELECT statements
  const upperSql = sql.toUpperCase();

  // Extract table name
  const fromMatch = sql.match(/FROM\s+"?([^"\s]+)"?/i);
  if (!fromMatch) return [];

  const tableName = fromMatch[1];
  const dataset = datasets.find(d => d.id === tableName);
  if (!dataset) return [];

  let data = [...(dataset.data || [])];

  // Check for LIMIT
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    data = data.slice(0, parseInt(limitMatch[1]));
  }

  // Check for WHERE clause
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:GROUP|ORDER|LIMIT|$)/i);
  if (whereMatch) {
    const condition = whereMatch[1].trim();
    // Simple condition parsing
    const condMatch = condition.match(/(\w+)\s*([=<>!]+)\s*['"]?([^'"]+)['"]?/);
    if (condMatch) {
      const [, col, op, val] = condMatch;
      data = data.filter(row => {
        const rowVal = row[col];
        switch (op) {
          case "=": return rowVal == val;
          case ">": return Number(rowVal) > Number(val);
          case "<": return Number(rowVal) < Number(val);
          default: return true;
        }
      });
    }
  }

  // Check for GROUP BY
  const groupMatch = sql.match(/GROUP\s+BY\s+(\w+)/i);
  if (groupMatch) {
    const groupCol = groupMatch[1];
    const groups = new Map<string, Record<string, unknown>[]>();

    data.forEach(row => {
      const key = String(row[groupCol]);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    });

    // Check for aggregations in SELECT
    const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
    if (selectMatch) {
      const selectParts = selectMatch[1].split(",").map(s => s.trim());

      data = [];
      groups.forEach((rows) => {
        const newRow: Record<string, unknown> = {};
        newRow[groupCol] = rows[0][groupCol];

        selectParts.forEach(part => {
          const aggMatch = part.match(/(SUM|COUNT|AVG|MIN|MAX)\s*\(\s*(\w+)\s*\)/i);
          if (aggMatch) {
            const [, agg, col] = aggMatch;
            const values = rows.map(r => Number(r[col])).filter(v => !isNaN(v));
            const alias = part.includes(" AS ")
              ? part.split(/\s+AS\s+/i)[1].trim()
              : `${agg.toLowerCase()}_${col}`;
            newRow[alias] = applyAggregation(values, agg.toLowerCase() as AggregationType);
          }
        });

        data.push(newRow);
      });
    }
  }

  return data;
}
