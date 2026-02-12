import type { DatasetColumn } from "@shared/schema";

export function parseCSV(csvContent: string): Record<string, unknown>[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse headers
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const data: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Pass the full line to existing parser
    const values = parseCSVLine(line);

    // Handle edge case where last empty columns might be missing in split, usually parseCSVLine handles it.
    // If values length < headers length, pad with nulls? Or skip?
    // CSV parsers often pad.

    const row: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      if (!header) continue; // Skip empty headers

      const value = j < values.length ? values[j] : "";
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
  const trimmed = value.trim();
  if (trimmed === "" || trimmed.toLowerCase() === "null") {
    return null;
  }

  // Aggressively remove surrounding quotes (single or double) from the start and end
  // This handles specific cases like "\"28" -> "28" or "\"200.00\"" -> "200.00"
  let cleanValue = trimmed.replace(/^["']+|["']+$/g, '');

  if (cleanValue.toLowerCase() === "true") return true;
  if (cleanValue.toLowerCase() === "false") return false;

  // Try parsing as number (handle commas, currency symbols if simple)
  // Remove simple currency symbols or commas for number check
  // Also remove any internal quotes if they are thousands separators or artifacts (unlikely but possible)
  const numString = cleanValue.replace(/[,$"']/g, "");

  // Strict number check: must be non-empty and valid number
  if (numString !== "" && !isNaN(Number(numString))) {
    return Number(numString);
  }

  // Try parsing date
  // Support YYYY-MM-DD or DD-MMM-YY (01-Jan-25)
  const dateObj = new Date(cleanValue);
  if (!isNaN(dateObj.getTime()) && cleanValue.length > 5) {
    // Check for year to avoid converting simple numbers to dates (e.g. "2025")
    // But "2025" IS a date (Jan 1st). However, usually we want it as number if it looks like year.
    // If the original string was "2025", numString check above would catch it.
    // If it was "01-Jan-25", numString check fails, so we are here.
    return dateObj.toISOString();
  }

  return cleanValue;
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
      // Check for ISO Date string often produced by our parseValue
      if (!isNaN(Date.parse(v)) && (v.includes('-') || v.includes('/') || v.includes('Jan') || v.includes('Feb') /* etc */)) {
        return "date";
      }
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
