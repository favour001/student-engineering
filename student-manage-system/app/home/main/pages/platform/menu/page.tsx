"use client"

import React, { useState, useEffect } from "react"
import { Search, SearchFieldConfig } from "../../components/search"
import { Page } from "../../components/page"
import { CustomTable, ColumnConfig } from "../../components/table"
import { Chip, Tooltip, Button } from "@heroui/react"
import { EyeIcon, DeleteIcon, EditIcon } from "../../components/table/components/icon"
import { menuApi, MenuData, MenuQueryParams } from "./services/menuApi"

const searchConfig: SearchFieldConfig[] = [
  {
    name: "name",
    label: "菜单名称",
    type: "text",
    placeholder: "请输入菜单名称"
  },
  {
    name: "code",
    label: "菜单编码",
    type: "text",
    placeholder: "请输入菜单编码"
  },
  {
    name: "type",
    label: "菜单类型",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "目录", value: "1" },
      { label: "菜单", value: "2" },
      { label: "按钮", value: "3" }
    ]
  },
  {
    name: "category",
    label: "菜单分类",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "平台", value: "1" },
      { label: "项目", value: "2" }
    ]
  },
  {
    name: "status",
    label: "状态",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "正常", value: "0" },
      { label: "禁用", value: "1" }
    ]
  }
]

const columns: ColumnConfig[] = [
  { name: "菜单名称", uid: "name", sortable: true },
  { name: "菜单编码", uid: "code" },
  { name: "类型", uid: "type", align: "center" },
  { name: "分类", uid: "category", align: "center" },
  { name: "图标", uid: "icon", align: "center" },
  { name: "路径", uid: "path" },
  { name: "排序", uid: "sortNumber", align: "center", sortable: true },
  { name: "状态", uid: "status", align: "center" },
  { name: "创建时间", uid: "createTime", sortable: true },
  { name: "操作", uid: "actions", align: "center" }
]

const statusMap: Record<number, { label: string; color: "success" | "danger" | "warning" }> = {
  0: { label: "正常", color: "success" },
  1: { label: "禁用", color: "danger" }
}

const typeMap: Record<number, { label: string; color: "primary" | "secondary" | "default" }> = {
  1: { label: "目录", color: "primary" },
  2: { label: "菜单", color: "secondary" },
  3: { label: "按钮", color: "default" }
}

const categoryMap: Record<number, string> = {
  1: "平台",
  2: "项目"
}

export default function MenuManagePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [menuData, setMenuData] = useState<MenuData[]>([])
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})

  const fetchMenus = async (params: MenuQueryParams = {}) => {
    setLoading(true)
    try {
      const queryParams: MenuQueryParams = {
        page: currentPage,
        limit: pageSize,
        ...params
      }

      const result = await menuApi.getMenus(queryParams)
      setMenuData(result.list || [])
      setTotal(result.total || 0)
    } catch (error) {
      console.error("获取菜单列表失败:", error)
      alert("获取菜单列表失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus(searchParams)
  }, [currentPage, pageSize])

  const handleSearch = (values: Record<string, any>) => {
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
    )
    setSearchParams(filteredValues)
    setCurrentPage(1)
    fetchMenus(filteredValues)
  }

  const handleReset = () => {
    setSearchParams({})
    setCurrentPage(1)
    fetchMenus({})
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleView = (menu: MenuData) => {
    console.log("查看菜单:", menu)
  }

  const handleEdit = (menu: MenuData) => {
    console.log("编辑菜单:", menu)
  }

  const handleDelete = async (menu: MenuData) => {
    if (confirm(`确定要删除菜单 ${menu.name} 吗？`)) {
      try {
        await menuApi.deleteMenu(menu.id)
        alert("删除成功")
        fetchMenus(searchParams)
      } catch (error) {
        console.error("删除菜单失败:", error)
        alert("删除失败，请稍后重试")
      }
    }
  }

  const renderCell = (item: MenuData, columnKey: string) => {
    const cellValue = item[columnKey as keyof MenuData]

    switch (columnKey) {
      case "type":
        const typeInfo = typeMap[item.type] || { label: "未知", color: "default" as const }
        return (
          <Chip
            className="capitalize"
            color={typeInfo.color}
            size="sm"
            variant="flat"
          >
            {typeInfo.label}
          </Chip>
        )

      case "category":
        return (
          <span className="text-sm">
            {categoryMap[item.category] || "-"}
          </span>
        )

      case "icon":
        return (
          <span className="text-sm text-default-600">
            {item.icon || "-"}
          </span>
        )

      case "status":
        const statusInfo = statusMap[item.status] || { label: "未知", color: "warning" as const }
        return (
          <Chip
            className="capitalize"
            color={statusInfo.color}
            size="sm"
            variant="flat"
          >
            {statusInfo.label}
          </Chip>
        )

      case "createTime":
        return (
          <span className="text-sm text-default-600">
            {item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : "-"}
          </span>
        )

      case "actions":
        return (
          <div className="relative flex items-center gap-2 justify-center">
            <Tooltip content="查看详情">
              <span 
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => handleView(item)}
              >
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="编辑">
              <span 
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => handleEdit(item)}
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="删除">
              <span 
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => handleDelete(item)}
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        )

      default:
        return String(cellValue || "-")
    }
  }

  return (
    <div className="w-full p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">菜单管理</h1>
        <Button color="primary" size="md">
          新增菜单
        </Button>
      </div>

      <Search
        fields={searchConfig}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <CustomTable
          columns={columns}
          data={menuData}
          renderCell={renderCell}
          rowKey="id"
          ariaLabel="菜单列表"
          emptyContent={loading ? "加载中..." : "暂无数据"}
        />

        <Page
          current={currentPage}
          total={total}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  )
}
