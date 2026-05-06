"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
} from "@heroui/react";
import { Plus, SearchIcon, Smartphone } from "lucide-react";

import { Page } from "../../components/page";
import { Search, SearchFieldConfig } from "../../components/search";
import { CustomTable, ColumnConfig } from "../../components/table";
import {
  appPageMenuApi,
  AppPageMenuData,
} from "./services/appPageMenuApi";

const statusMap: Record<number, { label: string; color: "success" | "danger" }> =
  {
    0: { label: "启用", color: "success" },
    1: { label: "禁用", color: "danger" },
  };

const initialForm: Partial<AppPageMenuData> = {
  name: "",
  path: "",
  icon: "",
  sortNumber: 0,
  status: 0,
  remark: "",
};

const searchFields: SearchFieldConfig[] = [
  { name: "name", label: "页面名称", type: "text", placeholder: "请输入页面名称" },
  {
    name: "status",
    label: "状态",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "启用", value: "0" },
      { label: "禁用", value: "1" },
    ],
  },
];

const columns: ColumnConfig[] = [
  { name: "页面名称", uid: "name" },
  { name: "小程序路径", uid: "path" },
  { name: "图标", uid: "icon" },
  { name: "排序", uid: "sortNumber", align: "center" },
  { name: "状态", uid: "status", align: "center" },
  { name: "操作", uid: "actions", align: "center" },
];

export default function AppPageMenuPage() {
  const [items, setItems] = useState<AppPageMenuData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AppPageMenuData | null>(null);
  const [form, setForm] = useState<Partial<AppPageMenuData>>(initialForm);

  const enabledCount = useMemo(
    () => items.filter((item) => item.status === 0).length,
    [items],
  );

  const fetchList = async () => {
    setLoading(true);
    try {
      const result = await appPageMenuApi.getMenus({
        page,
        limit,
        ...query,
      });
      setItems(result.list);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, limit, query]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (item: AppPageMenuData) => {
    setEditingItem(item);
    setForm(item);
    setModalOpen(true);
  };

  const submit = async () => {
    if (!form.name || !form.path) {
      alert("请填写页面名称和小程序路径");
      return;
    }

    const payload = {
      ...form,
      sortNumber: Number(form.sortNumber || 0),
      status: Number(form.status || 0),
    };

    if (editingItem) {
      await appPageMenuApi.updateMenu(editingItem.id, payload);
    } else {
      await appPageMenuApi.createMenu(payload);
    }

    setModalOpen(false);
    await fetchList();
  };

  const remove = async (item: AppPageMenuData) => {
    if (!window.confirm(`确定删除「${item.name}」吗？`)) return;
    await appPageMenuApi.deleteMenu(item.id);
    await fetchList();
  };

  const renderCell = (item: AppPageMenuData, columnKey: string) => {
    switch (columnKey) {
      case "name":
        return <span className="font-semibold text-slate-900">{item.name}</span>;
      case "path":
        return <span className="text-sm text-slate-500">{item.path}</span>;
      case "icon":
        return item.icon || "-";
      case "status":
        return (
          <Chip color={statusMap[item.status]?.color || "default"} size="sm" variant="flat">
            {statusMap[item.status]?.label || "未知"}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex justify-center gap-2">
            <Button size="sm" variant="flat" onPress={() => openEdit(item)}>
              编辑
            </Button>
            <Button color="danger" size="sm" variant="light" onPress={() => remove(item)}>
              删除
            </Button>
          </div>
        );
      default:
        return String(item[columnKey as keyof AppPageMenuData] ?? "-");
    }
  };

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,_rgba(14,165,233,0.12),_rgba(255,255,255,0.95)_45%,_rgba(16,185,129,0.12))] p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              <Smartphone className="size-3.5" />
              Mini Program
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              小程序菜单
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              维护小程序页面路径，供首页金刚区等业务入口选择跳转目标。
            </p>
          </div>
          <Button
            className="bg-sky-600 text-white shadow-lg shadow-sky-100"
            color="primary"
            startContent={<Plus className="size-4" />}
            onPress={openCreate}
          >
            新增菜单
          </Button>
        </div>
      </section>

      <Search
        fields={searchFields}
        onReset={() => {
          setPage(1);
          setQuery({});
        }}
        onSearch={(values) => {
          setPage(1);
          setQuery(
            Object.fromEntries(
              Object.entries(values).filter(([, value]) => value !== ""),
            ),
          );
        }}
      />

      <section className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="mb-5 flex flex-wrap gap-4">
          <div className="rounded-2xl bg-sky-50 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-sky-600">
              Total
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {total}
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-emerald-600">
              Enabled
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {enabledCount}
            </div>
          </div>
        </div>

        <CustomTable
          ariaLabel="小程序菜单列表"
          columns={columns}
          data={items}
          emptyContent={loading ? "加载中..." : "暂无数据"}
          renderCell={renderCell}
          rowKey="id"
        />
        <Page
          showSizeChanger
          current={page}
          pageSize={limit}
          total={total}
          onChange={setPage}
          onPageSizeChange={(size) => {
            setLimit(size);
            setPage(1);
          }}
        />
      </section>

      <Modal isOpen={modalOpen} size="2xl" onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>{editingItem ? "编辑小程序菜单" : "新增小程序菜单"}</ModalHeader>
          <ModalBody className="grid gap-4 md:grid-cols-2">
            <Input
              label="页面名称"
              value={form.name || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="小程序路径"
              placeholder="/pages/memberStyle/index"
              value={form.path || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, path: e.target.value }))}
            />
            <Input
              label="图标标识"
              value={form.icon || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
            />
            <Input
              label="排序"
              type="number"
              value={String(form.sortNumber ?? 0)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  sortNumber: Number(e.target.value || 0),
                }))
              }
            />
            <Select
              label="状态"
              selectedKeys={[String(form.status ?? 0)]}
              onSelectionChange={(keys) => {
                const nextValue = Array.from(keys)[0];
                setForm((prev) => ({ ...prev, status: Number(nextValue || 0) }));
              }}
            >
              <SelectItem key="0">启用</SelectItem>
              <SelectItem key="1">禁用</SelectItem>
            </Select>
            <div className="flex items-center rounded-2xl border border-slate-200 px-4">
              <Switch
                isSelected={(form.status ?? 0) === 0}
                onValueChange={(selected) =>
                  setForm((prev) => ({ ...prev, status: selected ? 0 : 1 }))
                }
              >
                启用
              </Switch>
            </div>
            <Input
              className="md:col-span-2"
              label="备注"
              value={form.remark || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setModalOpen(false)}>
              取消
            </Button>
            <Button className="bg-sky-600 text-white" color="primary" onPress={submit}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
