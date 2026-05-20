type CsvPrimitive = string | number | boolean | Date | null | undefined;

export function toCsvCell(value: CsvPrimitive) {
  if (value == null) {
    return "";
  }

  const normalized = value instanceof Date ? value.toISOString() : String(value);
  const escaped = normalized.replace(/"/g, '""');

  return `"${escaped}"`;
}

export function buildCsv(headers: string[], rows: CsvPrimitive[][]) {
  const lines = [
    headers.map((header) => toCsvCell(header)).join(","),
    ...rows.map((row) => row.map((cell) => toCsvCell(cell)).join(",")),
  ];

  return `${lines.join("\n")}\n`;
}
