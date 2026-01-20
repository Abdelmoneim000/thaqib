import type { DatasetColumn } from "@shared/schema";

export function parseCSV(csvContent: string): Record<string, unknown>[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const data: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const row: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].trim();
      const value = values[j].trim();
      row[header] = parseValue(value);
    }
    data.push(row);
  }

  return data;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

function parseValue(value: string): unknown {
  if (value === "" || value.toLowerCase() === "null") {
    return null;
  }

  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;

  const num = Number(value.replace(/,/g, ""));
  if (!isNaN(num) && value.trim() !== "") {
    return num;
  }

  const dateMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (dateMatch) {
    return value;
  }

  return value;
}

export function inferColumnTypes(data: Record<string, unknown>[]): DatasetColumn[] {
  if (data.length === 0) return [];

  const columns: DatasetColumn[] = [];
  const firstRow = data[0];
  const sampleRows = data.slice(0, Math.min(10, data.length));

  for (const key of Object.keys(firstRow)) {
    const sampleValues = sampleRows.map(row => row[key]).filter(v => v !== null);
    const type = inferType(sampleValues);
    
    columns.push({
      name: key,
      type,
      sampleValues: sampleValues.slice(0, 3),
    });
  }

  return columns;
}

function inferType(values: unknown[]): "string" | "number" | "date" | "boolean" {
  if (values.length === 0) return "string";

  const types = values.map(v => {
    if (typeof v === "boolean") return "boolean";
    if (typeof v === "number") return "number";
    if (typeof v === "string") {
      if (/^\d{4}-\d{2}-\d{2}/.test(v)) return "date";
    }
    return "string";
  });

  const typeCounts = types.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let maxType = "string";
  let maxCount = 0;
  for (const [type, count] of Object.entries(typeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxType = type;
    }
  }

  return maxType as "string" | "number" | "date" | "boolean";
}
