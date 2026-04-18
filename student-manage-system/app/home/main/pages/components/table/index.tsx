"use client"

import React from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react"

export interface ColumnConfig {
  name: string
  uid: string
  align?: "start" | "center" | "end"
  sortable?: boolean
}

export interface CustomTableProps {
  columns: ColumnConfig[]
  data: any[]
  renderCell?: (item: any, columnKey: string) => React.ReactNode
  rowKey?: string
  emptyContent?: string
  ariaLabel?: string
}

export function CustomTable({
  columns,
  data,
  renderCell,
  rowKey = "id",
  emptyContent = "暂无数据",
  ariaLabel = "数据表格"
}: CustomTableProps) {
  const defaultRenderCell = React.useCallback((item: any, columnKey: string) => {
    return item[columnKey] ?? "-"
  }, [])

  const cellRenderer = renderCell || defaultRenderCell

  return (
    <Table
      aria-label={ariaLabel}
      removeWrapper
      classNames={{
        th: "bg-slate-50 text-slate-500 text-xs uppercase tracking-[0.16em] border-b border-slate-200",
        td: "py-4 text-slate-700 border-b border-slate-100",
        tr: "hover:bg-sky-50/50 transition",
      }}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn 
            key={column.uid} 
            align={column.align || "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={data} emptyContent={emptyContent}>
        {(item) => (
          <TableRow key={item[rowKey]}>
            {(columnKey) => (
              <TableCell>{cellRenderer(item, columnKey as string)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

