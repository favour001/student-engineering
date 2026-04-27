export interface RawPaginatedResponse<T> {
  data?: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface NormalizedPaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const normalizePaginatedResponse = <T>(
  payload: RawPaginatedResponse<T> | undefined,
): NormalizedPaginatedResponse<T> => {
  const list = payload?.data ?? [];
  const total = payload?.meta?.total ?? list.length;
  const page = payload?.meta?.page ?? 1;
  const limit = payload?.meta?.limit ?? (list.length || 10);
  const totalPages =
    payload?.meta?.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return {
    list,
    total,
    page,
    limit,
    totalPages,
  };
};
