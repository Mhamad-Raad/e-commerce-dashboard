export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const paginate = (page = 1, pageSize = 20) => ({
  skip: (page - 1) * pageSize,
  take: pageSize,
});

export const buildPaginated = <T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> => ({ items, total, page, pageSize });
