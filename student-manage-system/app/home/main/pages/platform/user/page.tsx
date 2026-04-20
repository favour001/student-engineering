"use client"

import React, { useState, useEffect } from "react"
import { Search, SearchFieldConfig } from "../../components/search"
import { Page } from "../../components/page"
import { CustomTable, ColumnConfig } from "../../components/table"
import { User, Chip, Tooltip, Button } from "@heroui/react"
import { EyeIcon, DeleteIcon, EditIcon } from "../../components/table/components/icon"
import { userApi, UserData, UserQueryParams } from "./services/userApi"
import { resolveAssetUrl } from "@/utils/upload"

const searchConfig: SearchFieldConfig[] = [
  {
    name: "userName",
    label: "用户名",
    type: "text",
    placeholder: "请输入用户名"
  },
  {
    name: "account",
    label: "登录账号",
    type: "text",
    placeholder: "请输入登录账号"
  },
  {
    name: "phoneNumber",
    label: "手机号",
    type: "text",
    placeholder: "请输入手机号"
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
  },
  {
    name: "sex",
    label: "性别",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "男", value: "male" },
      { label: "女", value: "female" }
    ]
  }
]

const columns: ColumnConfig[] = [
  { name: "用户名", uid: "userName", sortable: true },
  { name: "登录账号", uid: "account", sortable: true },
  { name: "性别", uid: "sex", align: "center" },
  { name: "手机号", uid: "phoneNumber" },
  { name: "邮箱", uid: "email" },
  { name: "状态", uid: "status", align: "center" },
  { name: "创建时间", uid: "createTime", sortable: true },
  { name: "操作", uid: "actions", align: "center" }
]

const statusMap: Record<number, { label: string; color: "success" | "danger" | "warning" }> = {
  0: { label: "正常", color: "success" },
  1: { label: "禁用", color: "danger" }
}

const sexMap: Record<string, string> = {
  male: "男",
  female: "女"
}

export default function UserManagePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<UserData[]>([])
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})

  const fetchUsers = async (params: UserQueryParams = {}) => {
    setLoading(true)
    try {
      const queryParams: UserQueryParams = {
        page: currentPage,
        limit: pageSize,
        ...params
      }

      const result = await userApi.getUsers(queryParams)
      setUserData(result.list || [])
      setTotal(result.total || 0)
    } catch (error) {
      console.error("获取用户列表失败:", error)
      alert("获取用户列表失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(searchParams)
  }, [currentPage, pageSize])

  const handleSearch = (values: Record<string, any>) => {
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
    )
    setSearchParams(filteredValues)
    setCurrentPage(1)
    fetchUsers(filteredValues)
  }

  const handleReset = () => {
    setSearchParams({})
    setCurrentPage(1)
    fetchUsers({})
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleView = (user: UserData) => {
    console.log("查看用户:", user)
  }

  const handleEdit = (user: UserData) => {
    console.log("编辑用户:", user)
  }

  const handleDelete = async (user: UserData) => {
    if (confirm(`确定要删除用户 ${user.userName} 吗？`)) {
      try {
        await userApi.deleteUser(user.id)
        alert("删除成功")
        fetchUsers(searchParams)
      } catch (error) {
        console.error("删除用户失败:", error)
        alert("删除失败，请稍后重试")
      }
    }
  }

  const renderCell = (item: UserData, columnKey: string) => {
    const cellValue = item[columnKey as keyof UserData]

    switch (columnKey) {
      case "userName":
        return (
          <User
            avatarProps={{ 
              radius: "lg", 
              src: item.profileImage ? resolveAssetUrl(item.profileImage) : "/default-avatar.png",
              size: "sm"
            }}
            description={item.account}
            name={item.userName}
          />
        )

      case "sex":
        return (
          <span className="text-sm">
            {sexMap[item.sex] || "-"}
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
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Button color="primary" size="md">
          新增用户
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
          data={userData}
          renderCell={renderCell}
          rowKey="id"
          ariaLabel="用户列表"
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
