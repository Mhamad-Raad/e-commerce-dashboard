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

/**
 * Serialise rows to CSV. Prefixes a UTF-8 BOM so Excel renders Arabic and other
 * non-ASCII text correctly.
 */
export const toCsv = <T>(rows: T[], columns: CsvColumn<T>[]): string => {
  const head = columns.map((c) => escape(c.header)).join(',');
  const body = rows
    .map((row) => columns.map((c) => escape(c.value(row))).join(','))
    .join('\n');
  return `﻿${head}\n${body}\n`;
};

// Hard cap so an export can never try to load an unbounded result set into memory.
export const CSV_MAX_ROWS = 10000;
