"use client"

import React, { useState, useEffect } from "react"
import { Search, SearchFieldConfig } from "../../components/search"
import { Page } from "../../components/page"
import { CustomTable, ColumnConfig } from "../../components/table"
import { User, Chip, Tooltip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem } from "@heroui/react"
import { EyeIcon, DeleteIcon, EditIcon } from "../../components/table/components/icon"
import { Sparkles, Plus } from "lucide-react"
import { userApi, UserData, UserQueryParams } from "./services/userApi"
import { roleApi, RoleData } from "../role/services/roleApi"
import { FileUploadField } from "../../business/components/file-upload-field"
import { resolveAssetUrl } from "@/utils/upload"
import { systemStatusChipMap, systemStatusOptions, systemStatusSearchOptions, userSexLabelMap, userSexOptions, userSexSearchOptions } from "../../../lib/enums"

type UserFormState = Partial<UserData> & {
  password?: string
}

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
    options: systemStatusSearchOptions
  },
  {
    name: "sex",
    label: "性别",
    type: "select",
    options: userSexSearchOptions
  }
]

const columns: ColumnConfig[] = [
  { name: "用户名", uid: "userName", sortable: true },
  { name: "登录账号", uid: "account", sortable: true },
  { name: "角色", uid: "roles" },
  { name: "性别", uid: "sex", align: "center" },
  { name: "手机号", uid: "phoneNumber" },
  { name: "常用邮箱", uid: "email" },
  { name: "当前状态", uid: "status", align: "center" },
  { name: "入职/创建时间", uid: "createTime", sortable: true },
  { name: "操作", uid: "actions", align: "center" }
]

export default function UserManagePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<UserData[]>([])
  const [allRoles, setAllRoles] = useState<RoleData[]>([])
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [formState, setFormState] = useState<UserFormState>({
    userName: "",
    account: "",
    password: "",
    sex: "0",
    phoneNumber: "",
    email: "",
    profileImage: "",
    status: 0,
    roles: [],
  })

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
    roleApi.getRoles({ limit: 1000 }).then(res => setAllRoles(res.list || [])).catch(console.error)
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

  const handleCreate = () => {
    setEditingUser(null)
    setFormState({
      userName: "",
      account: "",
      password: "",
      sex: "0",
      phoneNumber: "",
      email: "",
      profileImage: "",
      status: 0,
      roles: [],
    })
    setIsModalOpen(true)
  }

  const handleEdit = (user: UserData) => {
    setEditingUser(user)
    setFormState({
      ...user,
      password: "", // 编辑时不填则不修改
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formState.userName || !formState.account) {
      alert("请填写用户名和登录账号")
      return
    }

    if (!editingUser && !formState.password) {
      alert("请输入初始密码")
      return
    }

    try {
      if (editingUser) {
        await userApi.updateUser(editingUser.id, formState)
      } else {
        await userApi.createUser(formState)
      }
      alert("保存成功")
      setIsModalOpen(false)
      fetchUsers(searchParams)
    } catch (error) {
      console.error("保存用户失败:", error)
      alert("保存失败")
    }
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
            {userSexLabelMap[item.sex] || "-"}
          </span>
        )

      case "roles":
        return (
          <div className="flex flex-wrap gap-1">
            {item.roles?.map((role) => (
              <Chip key={role.id} size="sm" variant="flat" color="primary">
                {role.name}
              </Chip>
            )) || "-"}
          </div>
        )

      case "status":
        const statusInfo = systemStatusChipMap[String(item.status)] || { label: "未知", color: "warning" as const }
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
            <Tooltip content="详情">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleView(item)}>
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="修改">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEdit(item)}>
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="删除">
              <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(item)}>
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
    <div className="space-y-5 p-5">
      <section className="rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,_rgba(14,165,233,0.12),_rgba(255,255,255,0.95)_45%,_rgba(16,185,129,0.12))] p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              <Sparkles className="size-3.5" />
              Platform Module
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">用户管理</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">管理系统管理员、分配部门和分配对应角色权限。</p>
          </div>
          <Button
            color="primary"
            startContent={<Plus className="size-4" />}
            className="bg-sky-600 text-white shadow-lg shadow-sky-100"
            onPress={handleCreate}
          >
            新增用户
          </Button>
        </div>
      </section>

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

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>{editingUser ? "编辑用户" : "新增用户"}</ModalHeader>
          <ModalBody className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FileUploadField
                label="头像"
                value={formState.profileImage || ""}
                onChange={(url) => setFormState((prev) => ({ ...prev, profileImage: url }))}
                folder="avatars"
              />
            </div>
            <Input label="用户名" value={formState.userName || ""} onChange={(e) => setFormState((prev) => ({ ...prev, userName: e.target.value }))} />
            <Input label="登录账号" value={formState.account || ""} onChange={(e) => setFormState((prev) => ({ ...prev, account: e.target.value }))} />
            {!editingUser && (
              <Input label="密码" type="password" value={formState.password || ""} onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))} />
            )}
            <Select
              label="性别"
              selectedKeys={[formState.sex || "0"]}
              onSelectionChange={(keys) => setFormState((prev) => ({ ...prev, sex: String(Array.from(keys)[0]) }))}
            >
              {userSexOptions.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
            <Input label="手机号" value={formState.phoneNumber || ""} onChange={(e) => setFormState((prev) => ({ ...prev, phoneNumber: e.target.value }))} />
            <Input label="邮箱" value={formState.email || ""} onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))} />
            <Select
              label="角色"
              selectionMode="multiple"
              selectedKeys={new Set(formState.roles?.map(r => String(r.id)))}
              onSelectionChange={(keys) => {
                const selectedIds = Array.from(keys).map(Number)
                const selectedRoles = allRoles.filter(r => selectedIds.includes(r.id))
                setFormState((prev) => ({ ...prev, roles: selectedRoles }))
              }}
            >
              {allRoles.map((role) => (
                <SelectItem key={String(role.id)}>{role.name}</SelectItem>
              ))}
            </Select>
            <Select
              label="状态"
              selectedKeys={[String(formState.status ?? 0)]}
              onSelectionChange={(keys) => setFormState((prev) => ({ ...prev, status: Number(Array.from(keys)[0] || 0) }))}
            >
              {systemStatusOptions.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsModalOpen(false)}>取消</Button>
            <Button color="primary" onPress={handleSubmit}>保存</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
