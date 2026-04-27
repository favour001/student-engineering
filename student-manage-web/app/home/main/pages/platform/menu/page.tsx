"use client";

import React, { useEffect, useState } from "react";
import {
  Chip,
  Tooltip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { Sparkles, Plus } from "lucide-react";

import { Search, SearchFieldConfig } from "../../components/search";
import { Page } from "../../components/page";
import { CustomTable, ColumnConfig } from "../../components/table";
import {
  menuCategoryLabelMap,
  menuCategoryOptions,
  menuCategorySearchOptions,
  menuTypeChipMap,
  menuTypeOptions,
  menuTypeSearchOptions,
  systemStatusChipMap,
  systemStatusOptions,
  systemStatusSearchOptions,
} from "../../../lib/enums";

import { menuApi, MenuData, MenuQueryParams } from "./services/menuApi";

import { EyeIcon, DeleteIcon, EditIcon } from "@/components/table-action-icons";

const searchConfig: SearchFieldConfig[] = [
  {
    name: "name",
    label: "菜单名称",
    type: "text",
    placeholder: "请输入菜单名称",
  },
  {
    name: "code",
    label: "菜单编码",
    type: "text",
    placeholder: "请输入菜单编码",
  },
  {
    name: "type",
    label: "菜单类型",
    type: "select",
    options: menuTypeSearchOptions,
  },
  {
    name: "category",
    label: "菜单分类",
    type: "select",
    options: menuCategorySearchOptions,
  },
  {
    name: "status",
    label: "状态",
    type: "select",
    options: systemStatusSearchOptions,
  },
];

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
  { name: "操作", uid: "actions", align: "center" },
];

export default function MenuManagePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState<MenuData[]>([]);
  const [allMenus, setAllMenus] = useState<MenuData[]>([]);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuData | null>(null);
  const [formState, setFormState] = useState<Partial<MenuData>>({
    name: "",
    code: "",
    type: 2,
    category: 1,
    icon: "",
    component: "",
    path: "",
    permission: "",
    sortNumber: 0,
    status: 0,
    describe: "",
    parentId: null,
  });

  const fetchMenus = async (params: MenuQueryParams = {}) => {
    setLoading(true);
    try {
      const queryParams: MenuQueryParams = {
        page: currentPage,
        limit: pageSize,
        ...params,
      };

      const result = await menuApi.getMenus(queryParams);

      setMenuData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      alert("获取菜单列表失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus(searchParams);
    menuApi
      .getAllMenus()
      .then(setAllMenus)
      .catch(() => undefined);
  }, [currentPage, pageSize]);

  const flattenTree = (
    menus: MenuData[],
    depth = 0,
  ): Array<MenuData & { depth: number }> => {
    let result: Array<MenuData & { depth: number }> = [];

    for (const menu of menus) {
      result.push({ ...menu, depth });
      if (menu.children && menu.children.length > 0) {
        result = result.concat(flattenTree(menu.children, depth + 1));
      }
    }

    return result;
  };

  const flattenedMenuOptions = flattenTree(allMenus);
  const flattenedTableData = flattenTree(menuData);

  const handleSearch = (values: Record<string, any>) => {
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined,
      ),
    );

    setSearchParams(filteredValues);
    setCurrentPage(1);
    fetchMenus(filteredValues);
  };

  const handleReset = () => {
    setSearchParams({});
    setCurrentPage(1);
    fetchMenus({});
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleView = (_menu: MenuData) => {};

  const handleCreate = () => {
    setEditingMenu(null);
    setFormState({
      name: "",
      code: "",
      type: 2,
      category: 1,
      icon: "",
      component: "",
      path: "",
      permission: "",
      sortNumber: 0,
      status: 0,
      describe: "",
      parentId: null,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (menu: MenuData) => {
    setEditingMenu(menu);
    setFormState({
      ...menu,
      parentId: menu.parentId ?? null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formState.name || !formState.code) {
      alert("请至少填写菜单名称和菜单编码");

      return;
    }

    const payload = {
      ...formState,
      sortNumber: Number(formState.sortNumber || 0),
      type: Number(formState.type || 2),
      category: Number(formState.category || 1),
      status: Number(formState.status || 0),
      parentId:
        formState.parentId === null || formState.parentId === undefined
          ? null
          : Number(formState.parentId),
    };

    try {
      if (editingMenu) {
        await menuApi.updateMenu(editingMenu.id, payload);
      } else {
        await menuApi.createMenu(payload);
      }
      alert("保存成功");
      setIsModalOpen(false);
      fetchMenus(searchParams);
      menuApi.getAllMenus().then(setAllMenus);
    } catch {
      alert("保存失败");
    }
  };

  const handleDelete = async (menu: MenuData) => {
    if (confirm(`确定要删除菜单 ${menu.name} 吗？`)) {
      try {
        await menuApi.deleteMenu(menu.id);
        alert("删除成功");
        fetchMenus(searchParams);
      } catch {
        alert("删除失败，请稍后重试");
      }
    }
  };

  const renderCell = (item: MenuData, columnKey: string) => {
    const cellValue = item[columnKey as keyof MenuData];

    switch (columnKey) {
      case "name":
        return (
          <div
            className="flex items-center gap-2"
            style={{
              paddingLeft: `${((item as MenuData & { depth?: number }).depth || 0) * 1.5}rem`,
            }}
          >
            {((item as MenuData & { depth?: number }).depth || 0) > 0 && (
              <span className="text-gray-300">├</span>
            )}
            {item.name}
          </div>
        );

      case "type":
        const typeInfo = menuTypeChipMap[String(item.type)] || {
          label: "未知",
          color: "default" as const,
        };

        return (
          <Chip
            className="capitalize"
            color={typeInfo.color}
            size="sm"
            variant="flat"
          >
            {typeInfo.label}
          </Chip>
        );

      case "category":
        return (
          <span className="text-sm">
            {menuCategoryLabelMap[String(item.category)] || "-"}
          </span>
        );

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
            <Tooltip content="详情">
              <button
                aria-label="查看菜单详情"
                className="text-lg text-default-400 active:opacity-50"
                type="button"
                onClick={() => handleView(item)}
              >
                <EyeIcon />
              </button>
            </Tooltip>
            <Tooltip content="修改">
              <button
                aria-label="编辑菜单"
                className="text-lg text-default-400 active:opacity-50"
                type="button"
                onClick={() => handleEdit(item)}
              >
                <EditIcon />
              </button>
            </Tooltip>
            <Tooltip color="danger" content="删除">
              <button
                aria-label="删除菜单"
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
    <div className="space-y-5 p-5">
      <section className="rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,_rgba(14,165,233,0.12),_rgba(255,255,255,0.95)_45%,_rgba(16,185,129,0.12))] p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              <Sparkles className="size-3.5" />
              Platform Module
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              菜单管理
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              管理系统内的功能菜单、权限控制和侧边栏展现。
            </p>
          </div>
          <Button
            className="bg-sky-600 text-white shadow-lg shadow-sky-100"
            color="primary"
            startContent={<Plus className="size-4" />}
            onPress={handleCreate}
          >
            新增菜单
          </Button>
        </div>
      </section>

      <Search
        fields={searchConfig}
        onReset={handleReset}
        onSearch={handleSearch}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <CustomTable
          ariaLabel="菜单列表"
          columns={columns}
          data={flattenedTableData}
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

      <Modal
        isOpen={isModalOpen}
        scrollBehavior="inside"
        size="3xl"
        onOpenChange={setIsModalOpen}
      >
        <ModalContent>
          <ModalHeader>{editingMenu ? "编辑菜单" : "新增菜单"}</ModalHeader>
          <ModalBody className="grid gap-4 md:grid-cols-2">
            <Input
              label="菜单名称"
              value={formState.name || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              label="菜单编码"
              value={formState.code || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, code: e.target.value }))
              }
            />
            <Select
              label="菜单类型"
              selectedKeys={[String(formState.type ?? 2)]}
              onSelectionChange={(keys) =>
                setFormState((prev) => ({
                  ...prev,
                  type: Number(Array.from(keys)[0] || 2),
                }))
              }
            >
              {menuTypeOptions.map((option) => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="菜单分类"
              selectedKeys={[String(formState.category ?? 1)]}
              onSelectionChange={(keys) =>
                setFormState((prev) => ({
                  ...prev,
                  category: Number(Array.from(keys)[0] || 1),
                }))
              }
            >
              {menuCategoryOptions.map((option) => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>
            <Input
              label="图标"
              value={formState.icon || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, icon: e.target.value }))
              }
            />
            <Input
              label="组件路径"
              value={formState.component || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, component: e.target.value }))
              }
            />
            <Input
              label="菜单路径"
              value={formState.path || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, path: e.target.value }))
              }
            />
            <Input
              label="权限标识"
              value={formState.permission || ""}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  permission: e.target.value,
                }))
              }
            />
            <Select
              label="父菜单"
              selectedKeys={
                formState.parentId === null || formState.parentId === undefined
                  ? ["none"]
                  : [String(formState.parentId)]
              }
              onSelectionChange={(keys) => {
                const parentId = Array.from(keys)[0];

                setFormState((prev) => ({
                  ...prev,
                  parentId:
                    parentId === "none" || parentId === undefined
                      ? null
                      : Number(parentId),
                }));
              }}
            >
              {[
                <SelectItem key="none">无（作为顶级菜单）</SelectItem>,
                ...flattenedMenuOptions.map((option) => (
                  <SelectItem key={String(option.id)}>
                    {"\u00A0\u00A0\u00A0\u00A0".repeat(option.depth)}├{" "}
                    {option.name}
                  </SelectItem>
                )),
              ]}
            </Select>
            <Input
              label="排序"
              type="number"
              value={String(formState.sortNumber ?? 0)}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  sortNumber: Number(e.target.value || 0),
                }))
              }
            />
            <Select
              label="状态"
              selectedKeys={[String(formState.status ?? 0)]}
              onSelectionChange={(keys) =>
                setFormState((prev) => ({
                  ...prev,
                  status: Number(Array.from(keys)[0] || 0),
                }))
              }
            >
              {systemStatusOptions.map((option) => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>
            <Textarea
              className="md:col-span-2"
              label="描述"
              minRows={4}
              value={formState.describe || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, describe: e.target.value }))
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
