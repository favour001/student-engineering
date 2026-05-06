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
import { ChevronDown, ChevronRight, Plus, SearchIcon, Sparkles, UserPlus, Users } from "lucide-react";

import {
  FileUploadField,
  IMAGE_UPLOAD_ACCEPT,
} from "../components/file-upload-field";
import { RichTextEditor } from "../components/rich-text-editor";
import { Search, SearchFieldConfig } from "../../components/search";
import { Page } from "../../components/page";
import { CustomTable, ColumnConfig } from "../../components/table";
import {
  BusinessExtraField,
  businessCategoryConfigMap,
  businessFieldLabelMap,
} from "../config";
import {
  BusinessAssignableUser,
  BusinessCategoryOption,
  BusinessContentItem,
  contentApi,
} from "../services/contentApi";
import { departmentApi } from "../../platform/department/services/departmentApi";
import { appPageMenuApi } from "../../platform/app-menu/services/appPageMenuApi";
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
  categoryId: "",
};

const dynamicCategoryBusinessKeys = new Set([
  "service-platform",
  "innovation-shunde",
  "vip",
  "welfare",
]);

const numericFieldKeys = new Set([
  "sortNumber",
  "status",
  "money",
  "quantity",
  "categoryId",
  "postId",
  "deptId",
]);

const dateFieldKeys = new Set([
  "publishedAt",
  "startTime",
  "endTime",
  "birthday",
]);

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

function getVisibleFormKeys(category: string): Array<keyof BusinessContentItem> {
  const config = businessCategoryConfigMap[category];
  if (!config) {
    return ["title"];
  }

  const keys = new Set<keyof BusinessContentItem>(["title"]);
  if (config.secondaryLabel) keys.add("subTitle");
  if (config.summaryLabel) keys.add("summary");
  if (config.contentLabel) keys.add("content");
  if (config.coverImageLabel) keys.add("coverImage");
  if (config.externalUrlLabel) keys.add("externalUrl");
  if (config.sourceLabel) keys.add("source");
  if (config.authorLabel) keys.add("author");
  if (config.publishedAtLabel) keys.add("publishedAt");
  if (config.enableStatus) keys.add("status");
  if (category === "article" || category === "study-abroad-news") {
    keys.add("sortNumber");
  }
  config.extraFields?.forEach((field) => keys.add(field.key));

  return Array.from(keys);
}

function getInitialFormState(category: string): Partial<BusinessContentItem> {
  const state: Partial<BusinessContentItem> = {
    category,
    title: "",
  };
  const writableState = state as Record<string, any>;

  getVisibleFormKeys(category).forEach((key) => {
    if (key === "title") return;
    if (numericFieldKeys.has(key)) {
      writableState[key] = key === "status" ? 0 : "";
      return;
    }
    writableState[key] = "";
  });

  return state;
}

function normalizePayloadValue(key: string, value: any) {
  if (dateFieldKeys.has(key)) {
    return value || null;
  }
  if (numericFieldKeys.has(key)) {
    if (value === "" || value === undefined || value === null) {
      return key === "status" ? 0 : null;
    }
    return Number(value);
  }
  return value ?? "";
}

function buildBusinessPayload(
  category: string,
  formState: Partial<BusinessContentItem>,
) {
  const payload: Partial<BusinessContentItem> = { category };
  const writablePayload = payload as Record<string, any>;
  getVisibleFormKeys(category).forEach((key) => {
    writablePayload[key] = normalizePayloadValue(key, formState[key]);
  });
  return payload;
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
  const [menuPathOptions, setMenuPathOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [contentCategories, setContentCategories] = useState<
    BusinessCategoryOption[]
  >([]);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [categoryForm, setCategoryForm] = useState<
    Partial<BusinessCategoryOption>
  >({ name: "", code: "", sortNumber: 0, status: 0 });

  const hasDynamicCategories = dynamicCategoryBusinessKeys.has(category);

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
        ...(hasDynamicCategories
          ? [
              {
                name: "categoryId",
                label: "分类",
                type: "select" as const,
                options: [
                  { label: "全部", value: "" },
                  ...contentCategories.map((item) => ({
                    label: item.name,
                    value: String(item.id),
                  })),
                ],
              },
            ]
          : []),
      ],
    [categoryConfig, contentCategories, hasDynamicCategories],
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

  const cardUserGroups = useMemo(() => {
    const groups = new Map<
      string,
      { userId: string; userName: string; mobile: string; items: BusinessContentItem[] }
    >();

    items.forEach((item) => {
      const userId = String(item.userId || item.subTitle || "unknown");
      const userName = item.userName || item.userNickName || `用户 ${userId}`;
      const mobile = item.userMobile || "";
      const group = groups.get(userId);

      if (group) {
        group.items.push(item);
        return;
      }

      groups.set(userId, { userId, userName, mobile, items: [item] });
    });

    return Array.from(groups.values());
  }, [items]);

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

  const fetchContentCategories = async () => {
    if (!hasDynamicCategories) {
      setContentCategories([]);
      return;
    }
    const rows = await contentApi.getCategories(category);
    setContentCategories(rows);
  };

  useEffect(() => {
    fetchList();
  }, [currentPage, pageSize, category, searchParams]);

  useEffect(() => {
    fetchContentCategories();
  }, [category, hasDynamicCategories]);

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

  useEffect(() => {
    if (category !== "quick-access") {
      return;
    }

    appPageMenuApi.getActiveMenus().then((menus) => {
      setMenuPathOptions(
        menus
          .filter((item) => item.path)
          .map((item) => ({
            label: `${item.name}（${item.path}）`,
            value: item.path,
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
    setFormState(getInitialFormState(category));
    setIsModalOpen(true);
  };

  const openEditModal = async (item: BusinessContentItem) => {
    const detail = await contentApi.getItem(item.id, category);

    setEditingItem(detail);
    setFormState({
      ...item,
      ...detail,
      cardTitle: detail.cardTitle || item.cardTitle,
      cardCoverImage: detail.cardCoverImage || item.cardCoverImage,
      userName: detail.userName || item.userName,
      userNickName: detail.userNickName || item.userNickName,
      userMobile: detail.userMobile || item.userMobile,
      userAvatar: detail.userAvatar || item.userAvatar,
      publishedAt: normalizeDateInput(detail.publishedAt),
      startTime: normalizeDateInput(detail.startTime),
      endTime: normalizeDateInput(detail.endTime),
      birthday: normalizeDateInput(detail.birthday),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = buildBusinessPayload(category, formState);

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

  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      alert("请填写分类名称");
      return;
    }
    await contentApi.createCategory({
      ...categoryForm,
      businessKey: category,
      sortNumber: Number(categoryForm.sortNumber || 0),
      status: Number(categoryForm.status || 0),
    });
    setCategoryForm({ name: "", code: "", sortNumber: 0, status: 0 });
    await fetchContentCategories();
  };

  const handleUpdateCategory = async (
    item: BusinessCategoryOption,
    patch: Partial<BusinessCategoryOption>,
  ) => {
    await contentApi.updateCategory(item.id, patch);
    await fetchContentCategories();
  };

  const handleDeleteCategory = async (item: BusinessCategoryOption) => {
    if (!window.confirm(`确定删除分类「${item.name}」吗？`)) return;
    await contentApi.deleteCategory(item.id, category);
    await fetchContentCategories();
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

  const assignmentPageUserIds = assignmentUsers.map((user) => user.id);
  const isAssignmentPageAllSelected =
    assignmentPageUserIds.length > 0 &&
    assignmentPageUserIds.every((id) => selectedUserIds.includes(id));

  const selectAssignmentPage = () => {
    setSelectedUserIds((prev) =>
      Array.from(new Set([...prev, ...assignmentPageUserIds])),
    );
  };

  const clearAssignmentPage = () => {
    setSelectedUserIds((prev) =>
      prev.filter((id) => !assignmentPageUserIds.includes(id)),
    );
  };

  const toggleAssignmentUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((currentId) => currentId !== userId)
        : [...prev, userId],
    );
  };

  const getAssignmentUserAvatar = (user: BusinessAssignableUser) =>
    user.coverImage ||
    user.userAvatar ||
    user.avatarUrl ||
    user.avatar ||
    user.avaterUrl ||
    "";

  const renderCell = (item: BusinessContentItem, columnKey: string) => {
    switch (columnKey) {
      case "title":
        if (category === "member-style") {
          return (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                {item.coverImage ? (
                  <img
                    alt={item.title}
                    className="size-full object-cover"
                    src={item.coverImage}
                  />
                ) : (
                  item.title?.slice(0, 1) || "-"
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {item.title}
                </p>
                {item.tags ? (
                  <p className="truncate text-xs text-slate-500">
                    {item.tags}
                  </p>
                ) : null}
              </div>
            </div>
          );
        }

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

  const toggleUserGroup = (userId: string) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const getCardTypeLabel = (value?: string | null) =>
    businessFieldLabelMap.cardType[value || ""] || value || "-";

  const getCardReceiveStatusLabel = (value?: string | null) =>
    businessFieldLabelMap.cardReceiveStatus[value || ""] || value || "-";

  const getCardUseStatusLabel = (value?: string | null) =>
    businessFieldLabelMap.useStatus[value || ""] || value || "-";

  const getCardFormName = () =>
    formState.cardTitle || formState.title || "-";

  const getCardFormUserName = () =>
    formState.userName ||
    formState.userNickName ||
    (formState.userMobile ? `用户 ${formState.userMobile}` : "") ||
    formState.subTitle ||
    formState.userId ||
    "-";

  const renderCardPackageGroups = () => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[minmax(220px,1.5fr)_120px_120px_160px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        <span>用户</span>
        <span>卡券数量</span>
        <span>待领取</span>
        <span>最近领取时间</span>
      </div>
      {cardUserGroups.length ? (
        cardUserGroups.map((group) => {
          const expanded =
            expandedUserIds.has(group.userId) || cardUserGroups.length === 1;
          const pendingCount = group.items.filter(
            (item) => item.receiveStatus === "2" || item.source === "2",
          ).length;
          const sortedCreateTimes = group.items
            .map((item) => item.createTime)
            .filter(Boolean)
            .sort();
          const latestTime = sortedCreateTimes[sortedCreateTimes.length - 1];

          return (
            <div key={group.userId} className="border-b border-slate-100 last:border-b-0">
              <button
                className="grid w-full cursor-pointer grid-cols-[minmax(220px,1.5fr)_120px_120px_160px] items-center gap-3 px-4 py-4 text-left transition hover:bg-sky-50/50"
                type="button"
                onClick={() => toggleUserGroup(group.userId)}
              >
                <span className="flex min-w-0 items-center gap-3">
                  {expanded ? (
                    <ChevronDown className="size-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-slate-400" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900">
                      {group.userName}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      ID {group.userId}
                      {group.mobile ? ` · ${group.mobile}` : ""}
                    </span>
                  </span>
                </span>
                <span className="text-sm text-slate-700">{group.items.length}</span>
                <span className="text-sm text-amber-600">{pendingCount}</span>
                <span className="text-sm text-slate-500">
                  {latestTime ? new Date(latestTime).toLocaleString("zh-CN") : "-"}
                </span>
              </button>

              {expanded ? (
                <div className="bg-slate-50/60 px-4 pb-4">
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead className="bg-white text-xs text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-left">卡券名称</th>
                          <th className="px-4 py-3 text-left">类型</th>
                          <th className="px-4 py-3 text-left">领取状态</th>
                          <th className="px-4 py-3 text-left">使用状态</th>
                          <th className="px-4 py-3 text-left">卡券ID</th>
                          <th className="px-4 py-3 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((item) => (
                          <tr key={item.id} className="border-t border-slate-100">
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {item.cardTitle || item.title || "-"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {getCardTypeLabel(item.cardType || item.summary)}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {getCardReceiveStatusLabel(item.receiveStatus || item.source)}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {getCardUseStatusLabel(item.useStatus)}
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {item.relationId || item.title}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                <Button size="sm" variant="flat" onPress={() => openEditModal(item)}>
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })
      ) : (
        <div className="py-12 text-center text-sm text-slate-500">
          {loading ? "加载中..." : "暂无数据"}
        </div>
      )}
    </div>
  );

  const renderExtraField = (field: BusinessExtraField) => {
    const value = formState[field.key];
    const dynamicOptions =
      field.key === "postId"
        ? postOptions
        : field.key === "deptId"
          ? departmentOptions
          : field.key === "categoryId"
            ? contentCategories.map((item) => ({
                label: item.name,
                value: String(item.id),
              }))
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
      const isImageUploadField = /image|avatar|cover|background|banner|photo/.test(
        `${field.key} ${field.label}`.toLowerCase(),
      ) || /certificate|证书/.test(`${field.key} ${field.label}`.toLowerCase());

      return (
        <FileUploadField
          accept={isImageUploadField ? IMAGE_UPLOAD_ACCEPT : undefined}
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
          <div className="flex flex-wrap gap-3">
            {hasDynamicCategories ? (
              <Button variant="flat" onPress={() => setCategoryManagerOpen(true)}>
                分类管理
              </Button>
            ) : null}
            <Button
              className="bg-sky-600 text-white shadow-lg shadow-sky-100"
              color="primary"
              startContent={<Plus className="size-4" />}
              onPress={openCreateModal}
            >
              新增内容
            </Button>
          </div>
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
              {category === "card" ? "用户数" : "Total"}
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {total}
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-emerald-600">
              {category === "card" ? "当前页卡券" : "With Image"}
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {category === "card"
                ? items.length
                : items.filter((item) => item.coverImage).length}
            </div>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-amber-600">
              {category === "card" ? "待领取" : "Interactive"}
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {category === "card"
                ? items.filter((item) => item.receiveStatus === "2" || item.source === "2").length
                : items.filter((item) => item.externalUrl || item.content).length}
            </div>
          </div>
        </div>

        {category === "card" ? (
          renderCardPackageGroups()
        ) : (
          <CustomTable
            ariaLabel={`${categoryConfig.title}列表`}
            columns={columns}
            data={items}
            emptyContent={loading ? "加载中..." : "暂无数据"}
            renderCell={renderCell}
            rowKey="id"
          />
        )}

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
            {category === "card" && editingItem ? (
              <>
                <Input
                  isReadOnly
                  label="卡券名称"
                  value={getCardFormName()}
                />
                <Input
                  isReadOnly
                  label="用户名称"
                  value={getCardFormUserName()}
                />
              </>
            ) : (
              <Input
                label={categoryConfig.primaryLabel}
                value={formState.title || ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            )}
            {categoryConfig.secondaryLabel ? (
              category === "card" && editingItem ? null : categoryConfig.secondaryOptions?.length ? (
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
                accept={IMAGE_UPLOAD_ACCEPT}
                folder={category}
                label={categoryConfig.coverImageLabel}
                value={formState.coverImage || ""}
                onChange={(nextValue) =>
                  setFormState((prev) => ({ ...prev, coverImage: nextValue }))
                }
              />
            ) : null}
            {categoryConfig.externalUrlLabel ? (
              category === "quick-access" ? (
                <Select
                  label={categoryConfig.externalUrlLabel}
                  selectedKeys={
                    formState.externalUrl ? [String(formState.externalUrl)] : []
                  }
                  onSelectionChange={(keys) => {
                    const nextValue = Array.from(keys)[0];

                    setFormState((prev) => ({
                      ...prev,
                      externalUrl: String(nextValue ?? ""),
                    }));
                  }}
                >
                  {menuPathOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              ) : (
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
              )
            ) : null}
            {categoryConfig.sourceLabel ? (
              categoryConfig.sourceOptions?.length ? (
                <Select
                  label={categoryConfig.sourceLabel}
                  selectedKeys={formState.source ? [String(formState.source)] : []}
                  onSelectionChange={(keys) => {
                    const nextValue = Array.from(keys)[0];

                    setFormState((prev) => ({
                      ...prev,
                      source: String(nextValue ?? ""),
                    }));
                  }}
                >
                  {categoryConfig.sourceOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              ) : (
                <Input
                  label={categoryConfig.sourceLabel}
                  value={formState.source || ""}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, source: e.target.value }))
                  }
                />
              )
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
              ) : categoryConfig.summaryInputType === "select" ? (
                <Select
                  className="md:col-span-2"
                  label={categoryConfig.summaryLabel}
                  selectedKeys={formState.summary ? [String(formState.summary)] : []}
                  onSelectionChange={(keys) => {
                    const nextValue = Array.from(keys)[0];

                    setFormState((prev) => ({
                      ...prev,
                      summary: String(nextValue ?? ""),
                    }));
                  }}
                >
                  {(categoryConfig.summaryOptions || []).map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
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
        isOpen={categoryManagerOpen}
        scrollBehavior="inside"
        size="4xl"
        onOpenChange={setCategoryManagerOpen}
      >
        <ModalContent>
          <ModalHeader>{categoryConfig.title}分类管理</ModalHeader>
          <ModalBody className="gap-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-3 text-sm font-medium text-slate-700">
                新增分类
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px_130px]">
              <Input
                label="分类名称"
                value={categoryForm.name || ""}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                label="分类编码"
                value={categoryForm.code || ""}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, code: e.target.value }))
                }
              />
              <Input
                label="排序"
                type="number"
                value={String(categoryForm.sortNumber ?? 0)}
                onChange={(e) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    sortNumber: Number(e.target.value || 0),
                  }))
                }
              />
              <Button className="self-end" color="primary" onPress={handleCreateCategory}>
                新增分类
              </Button>
              </div>
            </div>
            <div className="grid gap-3">
              {contentCategories.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(160px,1fr)_minmax(160px,1fr)_110px_150px]"
                >
                  <Input
                    label="名称"
                    value={item.name}
                    onChange={(e) =>
                      setContentCategories((prev) =>
                        prev.map((current) =>
                          current.id === item.id
                            ? { ...current, name: e.target.value }
                            : current,
                        ),
                      )
                    }
                  />
                  <Input
                    label="编码"
                    value={item.code}
                    onChange={(e) =>
                      setContentCategories((prev) =>
                        prev.map((current) =>
                          current.id === item.id
                            ? { ...current, code: e.target.value }
                            : current,
                        ),
                      )
                    }
                  />
                  <Input
                    label="排序"
                    type="number"
                    value={String(item.sortNumber ?? 0)}
                    onChange={(e) =>
                      setContentCategories((prev) =>
                        prev.map((current) =>
                          current.id === item.id
                            ? {
                                ...current,
                                sortNumber: Number(e.target.value || 0),
                              }
                            : current,
                        ),
                      )
                    }
                  />
                  <div className="flex items-end justify-end gap-2">
                    <Button
                      size="sm"
                      color="primary"
                      className="min-w-16"
                      onPress={() => handleUpdateCategory(item, item)}
                    >
                      保存
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      className="min-w-16"
                      onPress={() => handleDeleteCategory(item)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setCategoryManagerOpen(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={assignmentOpen}
        scrollBehavior="inside"
        size="4xl"
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
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <div className="flex flex-wrap items-center gap-3">
                  <span>可分配用户 {assignmentTotal} 人</span>
                  <span>已选择 {selectedUserIds.length} 人</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    isDisabled={!assignmentUsers.length || isAssignmentPageAllSelected}
                    size="sm"
                    variant="flat"
                    onPress={selectAssignmentPage}
                  >
                    全选当前页
                  </Button>
                  <Button
                    isDisabled={!assignmentUsers.length}
                    size="sm"
                    variant="light"
                    onPress={clearAssignmentPage}
                  >
                    清空当前页
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {assignmentLoading ? (
                  <div className="w-full py-10 text-center text-sm text-slate-500">
                    加载中...
                  </div>
                ) : assignmentUsers.length === 0 ? (
                  <div className="w-full py-10 text-center text-sm text-slate-500">
                    暂无可分配用户
                  </div>
                ) : (
                  assignmentUsers.map((user) => {
                    const selected = selectedUserIds.includes(user.id);
                    const avatar = getAssignmentUserAvatar(user);

                    return (
                      <div
                        key={user.id}
                        className={`flex min-w-[180px] cursor-pointer items-center gap-3 rounded-full border bg-white py-2 pl-2 pr-3 text-left transition ${
                          selected
                            ? "border-sky-300 bg-sky-50/60 shadow-sm"
                            : "border-slate-200 hover:border-sky-200 hover:bg-white"
                        }`}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleAssignmentUser(user.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleAssignmentUser(user.id);
                          }
                        }}
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                            {avatar ? (
                              <img
                                alt={user.title}
                                className="size-full object-cover"
                                src={avatar}
                              />
                            ) : (
                              user.title?.slice(0, 1) || "-"
                            )}
                          </span>
                          <span className="min-w-0 truncate font-medium text-slate-900">
                            {user.title}
                          </span>
                        </span>
                        <Checkbox
                          aria-label={`选择${user.title}`}
                          isSelected={selected}
                          onClick={(event) => event.stopPropagation()}
                          onValueChange={() => toggleAssignmentUser(user.id)}
                        />
                      </div>
                    );
                  })
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
