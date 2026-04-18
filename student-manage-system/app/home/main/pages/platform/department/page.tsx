"use client"

import React, { useState, useEffect } from "react"
import { Search, SearchFieldConfig } from "../../components/search"
import { Page } from "../../components/page"
import { CustomTable, ColumnConfig } from "../../components/table"
import { Chip, Tooltip, Button } from "@heroui/react"
import { EyeIcon, DeleteIcon, EditIcon } from "../../components/table/components/icon"
import { departmentApi, DepartmentData, DepartmentQueryParams } from "./services/departmentApi"

const searchConfig: SearchFieldConfig[] = [
  {
    name: "name",
    label: "部门名称",
    type: "text",
    placeholder: "请输入部门名称"
  },
  {
    name: "code",
    label: "部门编码",
    type: "text",
    placeholder: "请输入部门编码"
  },
  {
    name: "leader",
    label: "负责人",
    type: "text",
    placeholder: "请输入负责人"
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
  { name: "部门名称", uid: "name", sortable: true },
  { name: "部门编码", uid: "code", sortable: true },
  { name: "负责人", uid: "leader" },
  { name: "联系电话", uid: "phone" },
  { name: "邮箱", uid: "email" },
  { name: "地址", uid: "address" },
  { name: "排序", uid: "sortNumber", align: "center", sortable: true },
  { name: "状态", uid: "status", align: "center" },
  { name: "创建时间", uid: "createTime", sortable: true },
  { name: "操作", uid: "actions", align: "center" }
]

const statusMap: Record<number, { label: string; color: "success" | "danger" | "warning" }> = {
  0: { label: "正常", color: "success" },
  1: { label: "禁用", color: "danger" }
}

export default function DepartmentManagePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([])
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})

  const fetchDepartments = async (params: DepartmentQueryParams = {}) => {
    setLoading(true)
    try {
      const queryParams: DepartmentQueryParams = {
        page: currentPage,
        limit: pageSize,
        ...params
      }

      const result = await departmentApi.getDepartments(queryParams)
      setDepartmentData(result.list || [])
      setTotal(result.total || 0)
    } catch (error) {
      console.error("获取部门列表失败:", error)
      alert("获取部门列表失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments(searchParams)
  }, [currentPage, pageSize])

  const handleSearch = (values: Record<string, any>) => {
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
    )
    setSearchParams(filteredValues)
    setCurrentPage(1)
    fetchDepartments(filteredValues)
  }

  const handleReset = () => {
    setSearchParams({})
    setCurrentPage(1)
    fetchDepartments({})
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleView = (department: DepartmentData) => {
    console.log("查看部门:", department)
  }

  const handleEdit = (department: DepartmentData) => {
    console.log("编辑部门:", department)
  }

  const handleDelete = async (department: DepartmentData) => {
    if (confirm(`确定要删除部门 ${department.name} 吗？`)) {
      try {
        await departmentApi.deleteDepartment(department.id)
        alert("删除成功")
        fetchDepartments(searchParams)
      } catch (error) {
        console.error("删除部门失败:", error)
        alert("删除失败，请稍后重试")
      }
    }
  }

  const renderCell = (item: DepartmentData, columnKey: string) => {
    const cellValue = item[columnKey as keyof DepartmentData]

    switch (columnKey) {
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
        <h1 className="text-2xl font-bold">部门管理</h1>
        <Button color="primary" size="md">
          新增部门
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
          data={departmentData}
          renderCell={renderCell}
          rowKey="id"
          ariaLabel="部门列表"
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
