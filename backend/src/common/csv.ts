export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

// Spreadsheet apps execute a cell whose text starts with one of these — prefix
// such (string) values with a single quote so "=cmd()" can't run on open.
const FORMULA_LEAD = /^[=+\-@\t\r]/;

const escape = (value: unknown): string => {
  if (value == null) return '';
  // Numbers are never formulas — keep them as real numbers in the sheet.
  if (typeof value === 'number') return String(value);
  let s = String(value);
  if (FORMULA_LEAD.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Hard cap so an export can never try to load an unbounded result set into memory.
export const CSV_MAX_ROWS = 10000;

/**
 * Serialise rows to CSV. Prefixes a UTF-8 BOM so Excel renders Arabic and other
 * non-ASCII text correctly. When the result hit CSV_MAX_ROWS, appends a visible
 * note row so a truncated export isn't mistaken for the complete set.
 */
export const toCsv = <T>(rows: T[], columns: CsvColumn<T>[]): string => {
  const head = columns.map((c) => escape(c.header)).join(',');
  const body = rows
    .map((row) => columns.map((c) => escape(c.value(row))).join(','))
    .join('\n');
  const note =
    rows.length >= CSV_MAX_ROWS
      ? `${escape(`NOTE: export capped at ${CSV_MAX_ROWS} rows — refine your filters to export the rest`)}\n`
      : '';
  return `﻿${head}\n${body}\n${note}`;
};
