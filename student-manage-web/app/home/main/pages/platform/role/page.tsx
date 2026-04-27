"use client";

import React, { useState, useEffect } from "react";
import { Chip, Tooltip, Button } from "@heroui/react";

import { Search, SearchFieldConfig } from "../../components/search";
import { Page } from "../../components/page";
import { CustomTable, ColumnConfig } from "../../components/table";
import {
  systemStatusChipMap,
  systemStatusSearchOptions,
} from "../../../lib/enums";

import { roleApi, RoleData, RoleQueryParams } from "./services/roleApi";

import { EyeIcon, DeleteIcon, EditIcon } from "@/components/table-action-icons";

const searchConfig: SearchFieldConfig[] = [
  {
    name: "name",
    label: "角色名称",
    type: "text",
    placeholder: "请输入角色名称",
  },
  {
    name: "code",
    label: "角色编码",
    type: "text",
    placeholder: "请输入角色编码",
  },
  {
    name: "status",
    label: "状态",
    type: "select",
    options: systemStatusSearchOptions,
  },
];

const columns: ColumnConfig[] = [
  { name: "角色名称", uid: "name", sortable: true },
  { name: "角色编码", uid: "code", sortable: true },
  { name: "排序", uid: "sortNumber", align: "center", sortable: true },
  { name: "状态", uid: "status", align: "center" },
  { name: "描述", uid: "describe" },
  { name: "创建时间", uid: "createTime", sortable: true },
  { name: "操作", uid: "actions", align: "center" },
];

export default function RoleManagePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [roleData, setRoleData] = useState<RoleData[]>([]);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

  const fetchRoles = async (params: RoleQueryParams = {}) => {
    setLoading(true);
    try {
      const queryParams: RoleQueryParams = {
        page: currentPage,
        limit: pageSize,
        ...params,
      };

      const result = await roleApi.getRoles(queryParams);

      setRoleData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      alert("获取角色列表失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles(searchParams);
  }, [currentPage, pageSize]);

  const handleSearch = (values: Record<string, any>) => {
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined,
      ),
    );

    setSearchParams(filteredValues);
    setCurrentPage(1);
    fetchRoles(filteredValues);
  };

  const handleReset = () => {
    setSearchParams({});
    setCurrentPage(1);
    fetchRoles({});
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleView = (_role: RoleData) => {};

  const handleEdit = (_role: RoleData) => {};

  const handleDelete = async (role: RoleData) => {
    if (confirm(`确定要删除角色 ${role.name} 吗？`)) {
      try {
        await roleApi.deleteRole(role.id);
        alert("删除成功");
        fetchRoles(searchParams);
      } catch {
        alert("删除失败，请稍后重试");
      }
    }
  };

  const renderCell = (item: RoleData, columnKey: string) => {
    const cellValue = item[columnKey as keyof RoleData];

    switch (columnKey) {
      case "status":
        const statusInfo = systemStatusChipMap[String(item.status)] || {
          label: "未知",
          color: "warning" as const,
        };

        return (
          <Chip
            className="capitalize"
            color={statusInfo.color}
            size="sm"
            variant="flat"
          >
            {statusInfo.label}
          </Chip>
        );

      case "createTime":
        return (
          <span className="text-sm text-default-600">
            {item.createTime
              ? new Date(item.createTime).toLocaleString("zh-CN")
              : "-"}
          </span>
        );

      case "actions":
        return (
          <div className="relative flex items-center gap-2 justify-center">
            <Tooltip content="查看详情">
              <button
                aria-label="查看角色详情"
                className="text-lg text-default-400 active:opacity-50"
                type="button"
                onClick={() => handleView(item)}
              >
                <EyeIcon />
              </button>
            </Tooltip>
            <Tooltip content="编辑">
              <button
                aria-label="编辑角色"
                className="text-lg text-default-400 active:opacity-50"
                type="button"
                onClick={() => handleEdit(item)}
              >
                <EditIcon />
              </button>
            </Tooltip>
            <Tooltip color="danger" content="删除">
              <button
                aria-label="删除角色"
                className="text-lg text-danger active:opacity-50"
                type="button"
                onClick={() => handleDelete(item)}
              >
                <DeleteIcon />
              </button>
            </Tooltip>
          </div>
        );

      default:
        return String(cellValue || "-");
    }
  };

  return (
    <div className="w-full p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">角色管理</h1>
        <Button color="primary" size="md">
          新增角色
        </Button>
      </div>

      <Search
        fields={searchConfig}
        onReset={handleReset}
        onSearch={handleSearch}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <CustomTable
          ariaLabel="角色列表"
          columns={columns}
          data={roleData}
          emptyContent={loading ? "加载中..." : "暂无数据"}
          renderCell={renderCell}
          rowKey="id"
        />

        <Page
          showSizeChanger
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
