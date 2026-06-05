export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

const escape = (value: unknown): string => {
  const s = value == null ? '' : String(value);
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
