"use client";

import React, { useState, useEffect } from "react";
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

import { Search, SearchFieldConfig } from "../../components/search";
import { Page } from "../../components/page";
import { CustomTable, ColumnConfig } from "../../components/table";
import {
  systemStatusChipMap,
  systemStatusOptions,
  systemStatusSearchOptions,
} from "../../../lib/enums";

import { postApi, PostData, PostQueryParams } from "./services/postApi";

import { EyeIcon, DeleteIcon, EditIcon } from "@/components/table-action-icons";

const searchConfig: SearchFieldConfig[] = [
  {
    name: "name",
    label: "岗位名称",
    type: "text",
    placeholder: "请输入岗位名称",
  },
  {
    name: "code",
    label: "岗位编码",
    type: "text",
    placeholder: "请输入岗位编码",
  },
  {
    name: "status",
    label: "状态",
    type: "select",
    options: systemStatusSearchOptions,
  },
];

const columns: ColumnConfig[] = [
  { name: "岗位名称", uid: "name", sortable: true },
  { name: "岗位编码", uid: "code", sortable: true },
  { name: "排序", uid: "sortNumber", align: "center", sortable: true },
  { name: "状态", uid: "status", align: "center" },
  { name: "描述", uid: "describe" },
  { name: "创建时间", uid: "createTime", sortable: true },
  { name: "操作", uid: "actions", align: "center" },
];

export default function PostManagePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [postData, setPostData] = useState<PostData[]>([]);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostData | null>(null);
  const [formState, setFormState] = useState<Partial<PostData>>({
    name: "",
    code: "",
    sortNumber: 0,
    status: 0,
    describe: "",
  });

  const fetchPosts = async (params: PostQueryParams = {}) => {
    setLoading(true);
    try {
      const queryParams: PostQueryParams = {
        page: currentPage,
        limit: pageSize,
        ...params,
      };

      const result = await postApi.getPosts(queryParams);

      setPostData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      alert("获取岗位列表失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(searchParams);
  }, [currentPage, pageSize]);

  const handleSearch = (values: Record<string, any>) => {
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined,
      ),
    );

    setSearchParams(filteredValues);
    setCurrentPage(1);
    fetchPosts(filteredValues);
  };

  const handleReset = () => {
    setSearchParams({});
    setCurrentPage(1);
    fetchPosts({});
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleView = (_post: PostData) => {};

  const handleEdit = (post: PostData) => {
    setEditingPost(post);
    setFormState({ ...post });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(null);
    setFormState({
      name: "",
      code: "",
      sortNumber: 0,
      status: 0,
      describe: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formState.name || !formState.code) {
      alert("请填写岗位名称和岗位编码");

      return;
    }

    const payload = {
      ...formState,
      sortNumber: Number(formState.sortNumber || 0),
      status: Number(formState.status || 0),
    };

    if (editingPost) {
      await postApi.updatePost(editingPost.id, payload);
    } else {
      await postApi.createPost(payload);
    }

    setIsModalOpen(false);
    await fetchPosts(searchParams);
  };

  const handleDelete = async (post: PostData) => {
    if (confirm(`确定要删除岗位 ${post.name} 吗？`)) {
      try {
        await postApi.deletePost(post.id);
        alert("删除成功");
        fetchPosts(searchParams);
      } catch {
        alert("删除失败，请稍后重试");
      }
    }
  };

  const renderCell = (item: PostData, columnKey: string) => {
    const cellValue = item[columnKey as keyof PostData];

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
                aria-label="查看岗位详情"
                className="text-lg text-default-400 active:opacity-50"
                type="button"
                onClick={() => handleView(item)}
              >
                <EyeIcon />
              </button>
            </Tooltip>
            <Tooltip content="编辑">
              <button
                aria-label="编辑岗位"
                className="text-lg text-default-400 active:opacity-50"
                type="button"
                onClick={() => handleEdit(item)}
              >
                <EditIcon />
              </button>
            </Tooltip>
            <Tooltip color="danger" content="删除">
              <button
                aria-label="删除岗位"
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
        <h1 className="text-2xl font-bold">岗位管理</h1>
        <Button color="primary" size="md" onPress={handleCreate}>
          新增岗位
        </Button>
      </div>

      <Search
        fields={searchConfig}
        onReset={handleReset}
        onSearch={handleSearch}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <CustomTable
          ariaLabel="岗位列表"
          columns={columns}
          data={postData}
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
        size="2xl"
        onOpenChange={setIsModalOpen}
      >
        <ModalContent>
          <ModalHeader>{editingPost ? "编辑岗位" : "新增岗位"}</ModalHeader>
          <ModalBody className="grid gap-4 md:grid-cols-2">
            <Input
              label="岗位名称"
              value={formState.name || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              label="岗位编码"
              value={formState.code || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, code: e.target.value }))
              }
            />
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
