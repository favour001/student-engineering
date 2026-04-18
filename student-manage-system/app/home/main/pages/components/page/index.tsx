"use client"

import React from "react"
import { Pagination } from "@heroui/react"

export interface PageConfig {
  current: number
  total: number
  pageSize?: number
  onChange: (page: number) => void
  showSizeChanger?: boolean
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export function Page({
  current,
  total,
  pageSize = 10,
  onChange,
  showSizeChanger = false,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100]
}: PageConfig) {
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500">
        共 {total} 条记录，当前每页 {pageSize} 条
      </div>
      
      <div className="flex items-center gap-4">
        {showSizeChanger && onPageSizeChange && (
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="text-sm text-slate-500">每页</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-transparent text-sm text-slate-700 outline-none"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-slate-500">条</span>
          </div>
        )}
        
        <Pagination
          total={totalPages}
          page={current}
          onChange={onChange}
          showControls
          color="primary"
          size="sm"
          className="rounded-full bg-white px-2 py-1 shadow-sm"
        />
      </div>
    </div>
  )
}
