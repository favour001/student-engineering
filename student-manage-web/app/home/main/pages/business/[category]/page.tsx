"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
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
  Textarea,
  DatePicker,
} from "@heroui/react";
import { parseAbsoluteToLocal } from "@internationalized/date";
import { Plus, SearchIcon, Sparkles, UserPlus, Users } from "lucide-react";

import { FileUploadField } from "../components/file-upload-field";
import { RichTextEditor } from "../components/rich-text-editor";
import { Search, SearchFieldConfig } from "../../components/search";
import { Page } from "../../components/page";
import { CustomTable, ColumnConfig } from "../../components/table";
import { BusinessExtraField, businessCategoryConfigMap } from "../config";
import {
  BusinessAssignableUser,
  BusinessContentItem,
  contentApi,
} from "../services/contentApi";
import { departmentApi } from "../../platform/department/services/departmentApi";
import { postApi } from "../../platform/post/services/postApi";

const statusMap: Record<
  number,
  { label: string; color: "success" | "danger" }
> = {
  0: { label: "启用", color: "success" },
  1: { label: "禁用", color: "danger" },
};

const initialFormState: Partial<BusinessContentItem> = {
  title: "",
  subTitle: "",
  summary: "",
  content: "",
  coverImage: "",
  externalUrl: "",
  source: "",
  author: "",
  tags: "",
  sortNumber: 0,
  status: 0,
  publishedAt: "",
  startTime: "",
  endTime: "",
  address: "",
  money: 0,
  contactName: "",
  contactMobile: "",
  quantity: 0,
  extraType: "",
  rule: "",
  membershipDescribe: "",
  discountType: "",
  discount: "",
  relationId: "",
  userId: "",
  useStatus: "",
  userEnglishName: "",
  orderNumber: "",
  studyCountry: "",
  studySchool: "",
  major: "",
  certificate: "",
  gender: "",
  companyName: "",
  vipFlag: "",
  companyPost: "",
  companyAddress: "",
  auditStatus: "",
  socialPost: "",
  nickName: "",
  email: "",
  nativePlace: "",
  birthday: "",
  displayName: "",
  jobTitle: "",
  postId: "",
  deptId: "",
  memberRank: "",
  backgroundImage: "",
  honorRemark: "",
  companyRemark: "",
  jobRemark: "",
};

function normalizeDateInput(value?: string | null) {
  return value ? value.slice(0, 16) : "";
}

function stripHtml(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function getTablePreview(item: BusinessContentItem) {
  const candidates = [
    stripHtml(item.summary),
    stripHtml(item.content),
    stripHtml(item.tags),
    stripHtml(item.source),
    stripHtml(item.author),
    stripHtml(item.externalUrl),
    stripHtml(item.mobile),
  ];

  return candidates.find(Boolean) || "-";
}

function toDatePickerValue(value?: string | null) {
  return value
    ? (parseAbsoluteToLocal(new Date(String(value)).toISOString()) as any)
    : null;
}

function toDatePickerIsoString(value: any) {
  if (!value) {
    return "";
  }

  return typeof value.toDate === "function"
    ? value.toDate().toISOString()
    : new Date(String(value)).toISOString();
}

export default function BusinessCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const categoryConfig = businessCategoryConfigMap[category];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BusinessContentItem[]>([]);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessContentItem | null>(
    null,
  );
  const [formState, setFormState] =
    useState<Partial<BusinessContentItem>>(initialFormState);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentUsers, setAssignmentUsers] = useState<
    BusinessAssignableUser[]
  >([]);
  const [assignmentTotal, setAssignmentTotal] = useState(0);
  const [assignmentTarget, setAssignmentTarget] =
    useState<BusinessContentItem | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [assignmentQuery, setAssignmentQuery] = useState<{
    title?: string;
    mobile?: string;
  }>({});
  const [postOptions, setPostOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [departmentOptions, setDepartmentOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const searchFields = useMemo<SearchFieldConfig[]>(
    () =>
      categoryConfig?.searchFields?.map((field) => ({
        name: field.name,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        options: field.options,
      })) || [
        {
          name: "title",
          label: categoryConfig?.primaryLabel || "标题",
          type: "text",
          placeholder: `请输入${categoryConfig?.primaryLabel || "标题"}`,
        },
        ...(categoryConfig?.enableStatus
          ? [
              {
                name: "status",
                label: "状态",
                type: "select" as const,
                options: [
                  { label: "全部", value: "" },
                  { label: "启用", value: "0" },
                  { label: "禁用", value: "1" },
                ],
              },
            ]
          : []),
      ],
    [categoryConfig],
  );

  const columns: ColumnConfig[] = [
    { name: categoryConfig?.primaryLabel || "标题", uid: "title" },
    ...(categoryConfig?.secondaryLabel
      ? [{ name: categoryConfig.secondaryLabel, uid: "subTitle" }]
      : []),
    ...(categoryConfig?.summaryLabel
      ? [{ name: categoryConfig.summaryLabel, uid: "summary" }]
      : []),
    ...(categoryConfig?.enableStatus
      ? [{ name: "状态", uid: "status", align: "center" as const }]
      : []),
    {
      name: categoryConfig?.publishedAtLabel || "创建时间",
      uid: "publishedAt",
    },
    { name: "操作", uid: "actions", align: "center" },
  ];

  const secondaryOptionLabelMap = useMemo(
    () =>
      Object.fromEntries(
        (categoryConfig?.secondaryOptions || []).map((option) => [
          option.value,
          option.label,
        ]),
      ) as Record<string, string>,
    [categoryConfig?.secondaryOptions],
  );

  const fetchList = async () => {
    if (!categoryConfig) {
      return;
    }

    setLoading(true);

    try {
      const result = await contentApi.getList({
        page: currentPage,
        limit: pageSize,
        category,
        ...searchParams,
      });

      setItems(result.list);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [currentPage, pageSize, category, searchParams]);

  useEffect(() => {
    if (category !== "member-style") {
      return;
    }

    postApi.getPosts({ page: 1, limit: 200, status: "0" }).then((result) => {
      setPostOptions(
        result.list.map((item) => ({
          label: item.name,
          value: String(item.id),
        })),
      );
    });
    departmentApi.getAllDepartments().then((result) => {
      setDepartmentOptions(
        result
          .filter((item) => item.status === 0)
          .map((item) => ({
            label: item.name,
            value: String(item.id),
          })),
      );
    });
  }, [category]);

  if (!categoryConfig) {
    return (
      <div className="p-6">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-slate-600">
          未找到对应的业务分类页面。
        </div>
      </div>
    );
  }

  const handleSearch = (values: Record<string, any>) => {
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => value !== "" && value !== undefined && value !== null,
      ),
    );

    setCurrentPage(1);
    setSearchParams(filteredValues);
  };

  const handleReset = () => {
    setCurrentPage(1);
    setSearchParams({});
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormState({ ...initialFormState, category });
    setIsModalOpen(true);
  };

  const openEditModal = async (item: BusinessContentItem) => {
    const detail = await contentApi.getItem(item.id, category);

    setEditingItem(detail);
    setFormState({
      ...detail,
      publishedAt: normalizeDateInput(detail.publishedAt),
      startTime: normalizeDateInput(detail.startTime),
      endTime: normalizeDateInput(detail.endTime),
      birthday: normalizeDateInput(detail.birthday),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formState,
      category,
      publishedAt: formState.publishedAt || null,
      startTime: formState.startTime || null,
      endTime: formState.endTime || null,
      birthday: formState.birthday || null,
    };

    if (!payload.title) {
      alert(`请填写${categoryConfig.primaryLabel}`);

      return;
    }

    if (editingItem) {
      await contentApi.updateItem(editingItem.id, payload);
    } else {
      await contentApi.createItem(payload);
    }

    setIsModalOpen(false);
    await fetchList();
  };

  const handleDelete = async (item: BusinessContentItem) => {
    if (!confirm(`确定删除「${item.title}」吗？`)) {
      return;
    }

    await contentApi.deleteItem(item.id, category);
    await fetchList();
  };

  const handleStatusToggle = async (item: BusinessContentItem) => {
    const nextStatus = item.status === 0 ? 1 : 0;

    await contentApi.updateStatus(item.id, category, nextStatus);
    await fetchList();
  };

  const fetchAssignableUsers = async (
    target: BusinessContentItem,
    query: { title?: string; mobile?: string } = assignmentQuery,
  ) => {
    setAssignmentLoading(true);

    try {
      const result =
        category === "service-platform"
          ? await contentApi.getAssignableMerchantUsers(target.id, {
              page: 1,
              limit: 12,
              ...query,
            })
          : await contentApi.getAssignableCardUsers(
              target.id,
              category as "vip" | "welfare",
              {
                page: 1,
                limit: 12,
                ...query,
              },
            );

      setAssignmentUsers(result.list);
      setAssignmentTotal(result.total);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const openAssignmentModal = async (item: BusinessContentItem) => {
    setAssignmentTarget(item);
    setSelectedUserIds([]);
    setAssignmentQuery({});
    setAssignmentOpen(true);
    await fetchAssignableUsers(item, {});
  };

  const handleAssignmentSearch = async () => {
    if (!assignmentTarget) {
      return;
    }
    await fetchAssignableUsers(assignmentTarget, assignmentQuery);
  };

  const handleAssignmentSubmit = async () => {
    if (!assignmentTarget || selectedUserIds.length === 0) {
      alert("请至少选择一个用户");

      return;
    }

    if (category === "service-platform") {
      await contentApi.assignMerchantUsers(
        assignmentTarget.id,
        selectedUserIds,
      );
    } else {
      await contentApi.assignCardUsers(
        assignmentTarget.id,
        category as "vip" | "welfare",
        selectedUserIds,
      );
    }

    setAssignmentOpen(false);
    await fetchList();
  };

  const renderCell = (item: BusinessContentItem, columnKey: string) => {
    switch (columnKey) {
      case "title":
        return (
          <div className="space-y-1">
            <p className="font-semibold text-slate-900">{item.title}</p>
            {item.tags ? (
              <p className="text-xs text-slate-500">{item.tags}</p>
            ) : null}
          </div>
        );
      case "summary":
        return (
          <p className="max-w-[340px] truncate text-sm text-slate-500">
            {getTablePreview(item)}
          </p>
        );
      case "subTitle":
        return (
          secondaryOptionLabelMap[item.subTitle || ""] || item.subTitle || "-"
        );
      case "status":
        return (
          <button
            className="cursor-pointer"
            onClick={() => handleStatusToggle(item)}
          >
            <Chip
              color={statusMap[item.status]?.color || "default"}
              size="sm"
              variant="flat"
            >
              {statusMap[item.status]?.label || "未知"}
            </Chip>
          </button>
        );
      case "publishedAt":
        return (
          <span className="text-sm text-slate-500">
            {item.publishedAt || item.createTime
              ? new Date(
                  item.publishedAt || item.createTime || "",
                ).toLocaleString("zh-CN")
              : "-"}
          </span>
        );
      case "actions":
        return (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categoryConfig.assignment ? (
              <Button
                color="secondary"
                size="sm"
                variant="flat"
                onPress={() => openAssignmentModal(item)}
              >
                分配用户
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="flat"
              onPress={() => openEditModal(item)}
            >
              编辑
            </Button>
            <Button
              color="danger"
              size="sm"
              variant="light"
              onPress={() => handleDelete(item)}
            >
              删除
            </Button>
          </div>
        );
      default:
        return String(item[columnKey as keyof BusinessContentItem] || "-");
    }
  };

  const renderExtraField = (field: BusinessExtraField) => {
    const value = formState[field.key];
    const dynamicOptions =
      field.key === "postId"
        ? postOptions
        : field.key === "deptId"
          ? departmentOptions
          : field.options;

    if (field.type === "richtext") {
      return (
        <RichTextEditor
          key={field.key}
          folder={category}
          label={field.label}
          minHeight={220}
          value={String(value ?? "")}
          onChange={(nextValue) =>
            setFormState((prev) => ({ ...prev, [field.key]: nextValue }))
          }
        />
      );
    }

    if (field.type === "file") {
      return (
        <FileUploadField
          key={field.key}
          folder={category}
          label={field.label}
          value={String(value ?? "")}
          onChange={(nextValue) =>
            setFormState((prev) => ({ ...prev, [field.key]: nextValue }))
          }
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          key={field.key}
          className="md:col-span-2"
          label={field.label}
          minRows={4}
          value={String(value ?? "")}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, [field.key]: e.target.value }))
          }
        />
      );
    }

    if (field.type === "select") {
      return (
        <Select
          key={field.key}
          label={field.label}
          selectedKeys={value ? [String(value)] : []}
          onSelectionChange={(keys) => {
            const nextValue = Array.from(keys)[0];

            setFormState((prev) => ({
              ...prev,
              [field.key]: String(nextValue ?? ""),
            }));
          }}
        >
          {(dynamicOptions || []).map((option) => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          ))}
        </Select>
      );
    }

    if (field.type === "datetime-local") {
      return (
        <DatePicker
          key={field.key}
          showMonthAndYearPickers
          granularity="minute"
          label={field.label}
          value={toDatePickerValue(String(value ?? ""))}
          onChange={(nextValue: any) => {
            if (nextValue) {
              setFormState((prev) => ({
                ...prev,
                [field.key]: toDatePickerIsoString(nextValue),
              }));
            } else {
              setFormState((prev) => ({ ...prev, [field.key]: "" }));
            }
          }}
        />
      );
    }

    return (
      <Input
        key={field.key}
        label={field.label}
        type={field.type || "text"}
        value={
          field.type === "number" ? String(value ?? 0) : String(value ?? "")
        }
        onChange={(e) =>
          setFormState((prev) => ({
            ...prev,
            [field.key]:
              field.type === "number"
                ? Number(e.target.value || 0)
                : e.target.value,
          }))
        }
      />
    );
  };

  return (
    <div className="space-y-5 p-5">
      <section className="rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,_rgba(14,165,233,0.12),_rgba(255,255,255,0.95)_45%,_rgba(16,185,129,0.12))] p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              <Sparkles className="size-3.5" />
              Business Module
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              {categoryConfig.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {categoryConfig.subtitle}
            </p>
          </div>
          <Button
            className="bg-sky-600 text-white shadow-lg shadow-sky-100"
            color="primary"
            startContent={<Plus className="size-4" />}
            onPress={openCreateModal}
          >
            新增内容
          </Button>
        </div>
      </section>

      <Search
        fields={searchFields}
        onReset={handleReset}
        onSearch={handleSearch}
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
              With Image
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {items.filter((item) => item.coverImage).length}
            </div>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-amber-600">
              Interactive
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {items.filter((item) => item.externalUrl || item.content).length}
            </div>
          </div>
        </div>

        <CustomTable
          ariaLabel={`${categoryConfig.title}列表`}
          columns={columns}
          data={items}
          emptyContent={loading ? "加载中..." : "暂无数据"}
          renderCell={renderCell}
          rowKey="id"
        />

        <Page
          showSizeChanger
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </section>

      <Modal
        isOpen={isModalOpen}
        scrollBehavior="inside"
        size="4xl"
        onOpenChange={setIsModalOpen}
      >
        <ModalContent>
          <ModalHeader>
            {editingItem
              ? `编辑${categoryConfig.title}`
              : `新增${categoryConfig.title}`}
          </ModalHeader>
          <ModalBody className="grid gap-4 md:grid-cols-2">
            <Input
              label={categoryConfig.primaryLabel}
              value={formState.title || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            {categoryConfig.secondaryLabel ? (
              categoryConfig.secondaryOptions?.length ? (
                <Select
                  label={categoryConfig.secondaryLabel}
                  selectedKeys={
                    formState.subTitle ? [String(formState.subTitle)] : []
                  }
                  onSelectionChange={(keys) => {
                    const nextValue = Array.from(keys)[0];

                    setFormState((prev) => ({
                      ...prev,
                      subTitle: String(nextValue ?? ""),
                    }));
                  }}
                >
                  {categoryConfig.secondaryOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              ) : (
                <Input
                  label={categoryConfig.secondaryLabel}
                  value={formState.subTitle || ""}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      subTitle: e.target.value,
                    }))
                  }
                />
              )
            ) : null}
            {categoryConfig.coverImageLabel ? (
              <FileUploadField
                accept="image/*"
                folder={category}
                label={categoryConfig.coverImageLabel}
                value={formState.coverImage || ""}
                onChange={(nextValue) =>
                  setFormState((prev) => ({ ...prev, coverImage: nextValue }))
                }
              />
            ) : null}
            {categoryConfig.externalUrlLabel ? (
              <Input
                label={categoryConfig.externalUrlLabel}
                value={formState.externalUrl || ""}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    externalUrl: e.target.value,
                  }))
                }
              />
            ) : null}
            {categoryConfig.sourceLabel ? (
              <Input
                label={categoryConfig.sourceLabel}
                value={formState.source || ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, source: e.target.value }))
                }
              />
            ) : null}
            {categoryConfig.authorLabel ? (
              <Input
                label={categoryConfig.authorLabel}
                value={formState.author || ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, author: e.target.value }))
                }
              />
            ) : null}
            {categoryConfig.extraFields?.map(renderExtraField)}
            {category === "article" || category === "study-abroad-news" ? (
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
            ) : null}
            {categoryConfig.publishedAtLabel ? (
              <DatePicker
                showMonthAndYearPickers
                granularity="minute"
                label={categoryConfig.publishedAtLabel}
                value={toDatePickerValue(formState.publishedAt)}
                onChange={(value: any) => {
                  if (value) {
                    setFormState((prev) => ({
                      ...prev,
                      publishedAt: toDatePickerIsoString(value),
                    }));
                  } else {
                    setFormState((prev) => ({ ...prev, publishedAt: "" }));
                  }
                }}
              />
            ) : null}
            {categoryConfig.enableStatus ? (
              <div className="flex items-center gap-6 rounded-2xl border border-slate-200 px-4 py-3">
                <Switch
                  isSelected={(formState.status ?? 0) === 0}
                  onValueChange={(selected) =>
                    setFormState((prev) => ({
                      ...prev,
                      status: selected ? 0 : 1,
                    }))
                  }
                >
                  启用
                </Switch>
              </div>
            ) : null}
            {categoryConfig.summaryLabel ? (
              categoryConfig.summaryInputType === "richtext" ? (
                <RichTextEditor
                  folder={category}
                  label={categoryConfig.summaryLabel}
                  minHeight={220}
                  value={formState.summary || ""}
                  onChange={(nextValue) =>
                    setFormState((prev) => ({ ...prev, summary: nextValue }))
                  }
                />
              ) : (
                <Textarea
                  className="md:col-span-2"
                  label={categoryConfig.summaryLabel}
                  value={formState.summary || ""}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      summary: e.target.value,
                    }))
                  }
                />
              )
            ) : null}
            {categoryConfig.contentLabel ? (
              categoryConfig.contentInputType === "richtext" ? (
                <RichTextEditor
                  folder={category}
                  label={categoryConfig.contentLabel}
                  minHeight={320}
                  value={formState.content || ""}
                  onChange={(nextValue) =>
                    setFormState((prev) => ({ ...prev, content: nextValue }))
                  }
                />
              ) : (
                <Textarea
                  className="md:col-span-2"
                  label={categoryConfig.contentLabel}
                  minRows={10}
                  value={formState.content || ""}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                />
              )
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button
              className="bg-sky-600 text-white"
              color="primary"
              onPress={handleSubmit}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={assignmentOpen}
        scrollBehavior="inside"
        size="3xl"
        onOpenChange={setAssignmentOpen}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Users className="size-4 text-sky-600" />
            {categoryConfig.assignment?.title || "分配用户"}
            {assignmentTarget ? ` - ${assignmentTarget.title}` : ""}
          </ModalHeader>
          <ModalBody>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input
                label="用户昵称"
                value={assignmentQuery.title || ""}
                onChange={(e) =>
                  setAssignmentQuery((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
              <Input
                label="手机号"
                value={assignmentQuery.mobile || ""}
                onChange={(e) =>
                  setAssignmentQuery((prev) => ({
                    ...prev,
                    mobile: e.target.value,
                  }))
                }
              />
              <Button
                className="self-end bg-sky-600 text-white"
                startContent={<SearchIcon className="size-4" />}
                onPress={handleAssignmentSearch}
              >
                搜索
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
                <span>可分配用户 {assignmentTotal} 人</span>
                <span>已选择 {selectedUserIds.length} 人</span>
              </div>
              <div className="grid gap-3">
                {assignmentLoading ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    加载中...
                  </div>
                ) : assignmentUsers.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    暂无可分配用户
                  </div>
                ) : (
                  assignmentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {user.title}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          {[user.subTitle, user.mobile]
                            .filter(Boolean)
                            .join(" · ") || "暂无补充信息"}
                        </p>
                      </div>
                      <Checkbox
                        aria-label={`选择${user.title}`}
                        isSelected={selectedUserIds.includes(user.id)}
                        onValueChange={(selected) =>
                          setSelectedUserIds((prev) =>
                            selected
                              ? [...prev, user.id]
                              : prev.filter(
                                  (currentId) => currentId !== user.id,
                                ),
                          )
                        }
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setAssignmentOpen(false)}>
              取消
            </Button>
            <Button
              className="bg-sky-600 text-white"
              color="primary"
              startContent={<UserPlus className="size-4" />}
              onPress={handleAssignmentSubmit}
            >
              确认分配
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
