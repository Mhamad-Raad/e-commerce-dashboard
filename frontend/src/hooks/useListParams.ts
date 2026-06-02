import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const LIMIT_OPTIONS = [10, 20, 40, 60, 100];
export const DEFAULT_LIMIT = 20;

const MIN_LIMIT = LIMIT_OPTIONS[0];
const MAX_LIMIT = LIMIT_OPTIONS[LIMIT_OPTIONS.length - 1];

/** Snap an arbitrary number to the nearest allowed page size. */
export const clampLimit = (n: number): number => {
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  if (n <= MIN_LIMIT) return MIN_LIMIT;
  if (n >= MAX_LIMIT) return MAX_LIMIT;
  // nearest option
  return LIMIT_OPTIONS.reduce((best, opt) =>
    Math.abs(opt - n) < Math.abs(best - n) ? opt : best,
  );
};

interface UseListParamsOptions {
  /** Namespace for localStorage persistence of the page size, e.g. "products". */
  key: string;
}

/**
 * Single source of truth for a list view's URL state: page (1-based), page size
 * (`limit`), free-text search (`q`) and arbitrary named filters. The page size
 * is remembered in localStorage (URL > localStorage > default), mirroring the
 * akkooo dashboard. Mutating search/limit/filters resets the page to 1.
 */
export function useListParams({ key }: UseListParamsOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const storageKey = `${key}.limit`;

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const search = searchParams.get('q') ?? '';

  const urlLimit = searchParams.get('limit');
  let limit: number;
  if (urlLimit != null && urlLimit !== '' && Number.isFinite(Number(urlLimit))) {
    limit = clampLimit(Number(urlLimit));
  } else {
    const stored = Number(localStorage.getItem(storageKey));
    limit = Number.isFinite(stored) && stored > 0 ? clampLimit(stored) : DEFAULT_LIMIT;
  }

  const commit = useCallback(
    (mutate: (p: URLSearchParams) => void, replace = false) => {
      const next = new URLSearchParams(searchParams);
      mutate(next);
      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { replace });
      }
    },
    [searchParams, setSearchParams],
  );

  const setPage = useCallback(
    (p: number) =>
      commit((next) => {
        if (p <= 1) next.delete('page');
        else next.set('page', String(p));
      }),
    [commit],
  );

  const setSearch = useCallback(
    (value: string) =>
      commit((next) => {
        const v = value.trim();
        if (v) next.set('q', v);
        else next.delete('q');
        next.delete('page');
      }, true), // replace: don't add a history entry per keystroke
    [commit],
  );

  const setLimit = useCallback(
    (value: number) => {
      const clamped = clampLimit(value);
      localStorage.setItem(storageKey, String(clamped));
      commit((next) => {
        next.set('limit', String(clamped));
        next.delete('page');
      });
    },
    [commit, storageKey],
  );

  const getFilter = useCallback(
    (name: string) => searchParams.get(name) ?? '',
    [searchParams],
  );

  const setFilter = useCallback(
    (name: string, value: string) =>
      commit((next) => {
        if (value) next.set(name, value);
        else next.delete(name);
        next.delete('page');
      }),
    [commit],
  );

  return { page, limit, search, getFilter, setPage, setLimit, setSearch, setFilter };
}
