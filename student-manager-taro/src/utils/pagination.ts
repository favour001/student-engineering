export type PageResult<T> = {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  hasMore: boolean
}

export function normalizePageResult<T>(data: unknown, pageNum: number, pageSize: number): PageResult<T> {
  if (Array.isArray(data)) {
    return {
      list: data as T[],
      total: data.length,
      pageNum,
      pageSize,
      hasMore: data.length >= pageSize
    }
  }

  const result = (data || {}) as Partial<PageResult<T>>
  const list = Array.isArray(result.list) ? result.list : []
  return {
    list,
    total: Number(result.total || list.length),
    pageNum: Number(result.pageNum || pageNum),
    pageSize: Number(result.pageSize || pageSize),
    hasMore: Boolean(result.hasMore)
  }
}
