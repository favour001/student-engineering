"use client"

import React, { useState, useEffect } from "react"
import { Search, SearchFieldConfig } from "../../components/search"
import { Page } from "../../components/page"
import { CustomTable, ColumnConfig } from "../../components/table"
import { Chip, Tooltip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Textarea } from "@heroui/react"
import { EyeIcon, DeleteIcon, EditIcon } from "../../components/table/components/icon"
import { Sparkles, Plus } from "lucide-react"
import { departmentApi, DepartmentData, DepartmentQueryParams } from "./services/departmentApi"
import { systemStatusChipMap, systemStatusOptions, systemStatusSearchOptions } from "../../../lib/enums"

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
    options: systemStatusSearchOptions
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

export default function DepartmentManagePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([])
  const [allDepartments, setAllDepartments] = useState<DepartmentData[]>([])
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<DepartmentData | null>(null)
  const [formState, setFormState] = useState<Partial<DepartmentData>>({
    name: "",
    code: "",
    leader: "",
    phone: "",
    email: "",
    address: "",
    sortNumber: 0,
    status: 0,
    describe: "",
    parentId: null as any,
  })

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
    departmentApi.getAllDepartments().then(setAllDepartments).catch(console.error)
  }, [currentPage, pageSize])

  const flattenTree = (depts: DepartmentData[], depth = 0): (DepartmentData & { depth: number })[] => {
    let result: (DepartmentData & { depth: number })[] = []
    for (const dept of depts) {
      result.push({ ...dept, depth })
      if (dept.children && dept.children.length > 0) {
        result = result.concat(flattenTree(dept.children, depth + 1))
      }
    }
    return result
  }
  const flattenedTableData = flattenTree(departmentData)
  const flattenedDeptOptions = flattenTree(allDepartments)

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

  const handleCreate = () => {
    setEditingDept(null)
    setFormState({
      name: "",
      code: "",
      leader: "",
      phone: "",
      email: "",
      address: "",
      sortNumber: 0,
      status: 0,
      describe: "",
      parentId: null as any,
    })
    setIsModalOpen(true)
  }

  const handleEdit = (department: DepartmentData) => {
    setEditingDept(department)
    setFormState({
      ...department,
      parentId: department.parentId ?? (null as any),
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formState.name || !formState.code) {
      alert("请填写部门名称和编码")
      return
    }

    const payload = {
      ...formState,
      sortNumber: Number(formState.sortNumber || 0),
      status: Number(formState.status || 0),
      parentId:
        formState.parentId === null || formState.parentId === undefined || (formState.parentId as any) === "none"
          ? null
          : Number(formState.parentId),
    }

    try {
      if (editingDept) {
        await departmentApi.updateDepartment(editingDept.id, payload as any)
      } else {
        await departmentApi.createDepartment(payload as any)
      }
      alert("保存成功")
      setIsModalOpen(false)
      fetchDepartments(searchParams)
      departmentApi.getAllDepartments().then(setAllDepartments)
    } catch (error) {
      console.error("保存部门失败:", error)
      alert("保存失败")
    }
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
      case "name":
        return (
          <div style={{ paddingLeft: `${((item as any).depth || 0) * 1.5}rem` }} className="flex items-center gap-2">
            {((item as any).depth || 0) > 0 && <span className="text-gray-300">├</span>}
            {item.name}
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
    <div className="space-y-5 p-5">
      <section className="rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,_rgba(14,165,233,0.12),_rgba(255,255,255,0.95)_45%,_rgba(16,185,129,0.12))] p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              <Sparkles className="size-3.5" />
              Platform Module
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">部门管理</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">管理系统内的组织架构、层级划分与关键部门联系信息。</p>
          </div>
          <Button
            color="primary"
            startContent={<Plus className="size-4" />}
            className="bg-sky-600 text-white shadow-lg shadow-sky-100"
            onPress={handleCreate}
          >
            新增部门
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
          data={flattenedTableData}
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

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>{editingDept ? "编辑部门" : "新增部门"}</ModalHeader>
          <ModalBody className="grid gap-4 md:grid-cols-2">
            <Input label="部门名称" value={formState.name} onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))} />
            <Input label="部门编码" value={formState.code} onChange={(e) => setFormState(prev => ({ ...prev, code: e.target.value }))} />
            <Input label="负责人" value={formState.leader} onChange={(e) => setFormState(prev => ({ ...prev, leader: e.target.value }))} />
            <Input label="联系电话" value={formState.phone} onChange={(e) => setFormState(prev => ({ ...prev, phone: e.target.value }))} />
            <Input label="邮箱" value={formState.email} onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))} />
            <Input label="地址" value={formState.address} onChange={(e) => setFormState(prev => ({ ...prev, address: e.target.value }))} />
            <Select
              label="上级部门"
              selectedKeys={formState.parentId ? [String(formState.parentId)] : []}
              onSelectionChange={(keys) => {
                const parentId = Array.from(keys)[0]
                setFormState((prev) => ({
                  ...prev,
                  parentId: parentId ? Number(parentId) : (null as any),
                }))
              }}
            >
              {[
                <SelectItem key="none">无（作为顶级部门）</SelectItem>,
                ...flattenedDeptOptions.map((option) => (
                  <SelectItem key={String(option.id)}>
                    {"\u00A0\u00A0\u00A0\u00A0".repeat(option.depth)}├ {option.name}
                  </SelectItem>
                ))
              ]}
            </Select>
            <Input type="number" label="排序" value={String(formState.sortNumber || 0)} onChange={(e) => setFormState(prev => ({ ...prev, sortNumber: Number(e.target.value) }))} />
            <Select
              label="状态"
              selectedKeys={[String(formState.status ?? 0)]}
              onSelectionChange={(keys) => setFormState(prev => ({ ...prev, status: Number(Array.from(keys)[0] || 0) }))}
            >
              {systemStatusOptions.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
            <Textarea className="md:col-span-2" label="描述" minRows={3} value={formState.describe} onChange={(e) => setFormState(prev => ({ ...prev, describe: e.target.value }))} />
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
