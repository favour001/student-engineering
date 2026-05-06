"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  User,
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
} from "@heroui/react";
import { Sparkles, Plus } from "lucide-react";

import { Search, SearchFieldConfig } from "../../components/search";
import { Page } from "../../components/page";
import { CustomTable, ColumnConfig } from "../../components/table";
import { roleApi, RoleData } from "../role/services/roleApi";
import {
  FileUploadField,
  IMAGE_UPLOAD_ACCEPT,
} from "../../business/components/file-upload-field";
import {
  systemStatusChipMap,
  systemStatusOptions,
  systemStatusSearchOptions,
  userSexLabelMap,
  userSexOptions,
  userSexSearchOptions,
} from "../../../lib/enums";

import { userApi, UserData, UserQueryParams } from "./services/userApi";

import { EyeIcon, DeleteIcon, EditIcon } from "@/components/table-action-icons";
import { appStore } from "@/store";
import { resolveAssetUrl } from "@/utils/upload";

type UserFormState = Partial<UserData> & {
  password?: string;
};

const searchConfig: SearchFieldConfig[] = [
  {
    name: "userName",
    label: "用户名",
    type: "text",
    placeholder: "请输入用户名",
  },
  {
    name: "account",
    label: "登录账号",
    type: "text",
    placeholder: "请输入登录账号",
  },
  {
    name: "phoneNumber",
    label: "手机号",
    type: "text",
    placeholder: "请输入手机号",
  },
  {
    name: "status",
    label: "状态",
    type: "select",
    options: systemStatusSearchOptions,
  },
  {
    name: "sex",
    label: "性别",
    type: "select",
    options: userSexSearchOptions,
  },
];

const columns: ColumnConfig[] = [
  { name: "用户名", uid: "userName", sortable: true },
  { name: "登录账号", uid: "account", sortable: true },
  { name: "角色", uid: "roles" },
  { name: "性别", uid: "sex", align: "center" },
  { name: "手机号", uid: "phoneNumber" },
  { name: "常用邮箱", uid: "email" },
  { name: "当前状态", uid: "status", align: "center" },
  { name: "入职/创建时间", uid: "createTime", sortable: true },
  { name: "操作", uid: "actions", align: "center" },
];

const getCookieOptions = (days: number) => ({
  expires: days,
  secure:
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : false,
  sameSite: "lax" as const,
});

export default function UserManagePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [allRoles, setAllRoles] = useState<RoleData[]>([]);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
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
  });

  const fetchUsers = async (params: UserQueryParams = {}) => {
    setLoading(true);
    try {
      const queryParams: UserQueryParams = {
        page: currentPage,
        limit: pageSize,
        ...params,
      };

      const result = await userApi.getUsers(queryParams);

      setUserData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      alert("获取用户列表失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(searchParams);
    roleApi
      .getRoles({ limit: 1000 })
      .then((res) => setAllRoles(res.list || []))
      .catch(() => undefined);
  }, [currentPage, pageSize]);

  const handleSearch = (values: Record<string, any>) => {
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined,
      ),
    );

    setSearchParams(filteredValues);
    setCurrentPage(1);
    fetchUsers(filteredValues);
  };

  const handleReset = () => {
    setSearchParams({});
    setCurrentPage(1);
    fetchUsers({});
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleView = (_user: UserData) => {};

  const handleCreate = () => {
    setEditingUser(null);
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
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setFormState({
      ...user,
      password: "", // 编辑时不填则不修改
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formState.userName || !formState.account) {
      alert("请填写用户名和登录账号");

      return;
    }

    if (!editingUser && !formState.password) {
      alert("请输入初始密码");

      return;
    }

    try {
      const payload = { ...formState };

      if (!payload.password?.trim()) {
        delete payload.password;
      }

      if (editingUser) {
        await userApi.updateUser(editingUser.id, payload);
        syncCurrentUserInfo(editingUser.id, payload);
      } else {
        await userApi.createUser(payload);
      }
      alert("保存成功");
      setIsModalOpen(false);
      fetchUsers(searchParams);
    } catch {
      alert("保存失败");
    }
  };

  const syncCurrentUserInfo = (userId: number, nextUser: UserFormState) => {
    const currentUser =
      appStore.pageDomain.home.uiDomain.layout.leftSidebar.userInfo;

    if (!currentUser || currentUser.id !== userId) {
      return;
    }

    const updatedUser = {
      ...currentUser,
      userName: nextUser.userName || currentUser.userName,
      account: nextUser.account || currentUser.account,
      email: nextUser.email || "",
      phoneNumber: nextUser.phoneNumber || "",
      profileImage: nextUser.profileImage || "",
    };

    appStore.pageDomain.home.uiDomain.layout.leftSidebar.userInfo = updatedUser;
    Cookies.set("userInfo", JSON.stringify(updatedUser), getCookieOptions(7));
  };

  const handleDelete = async (user: UserData) => {
    if (confirm(`确定要删除用户 ${user.userName} 吗？`)) {
      try {
        await userApi.deleteUser(user.id);
        alert("删除成功");
        fetchUsers(searchParams);
      } catch {
        alert("删除失败，请稍后重试");
      }
    }
  };

  const renderCell = (item: UserData, columnKey: string) => {
    const cellValue = item[columnKey as keyof UserData];

    switch (columnKey) {
      case "userName":
        return (
          <div className="min-w-[132px] max-w-[180px]">
            <User
              avatarProps={{
                radius: "lg",
                src: item.profileImage
                  ? resolveAssetUrl(item.profileImage)
                  : "/default-avatar.png",
                size: "sm",
              }}
              classNames={{
                base: "min-w-0 justify-start",
                name: "max-w-[120px] truncate",
                description: "max-w-[120px] truncate",
              }}
              description={item.account}
              name={item.userName}
            />
          </div>
        );

      case "sex":
        return (
          <span className="text-sm">{userSexLabelMap[item.sex] || "-"}</span>
        );

      case "roles":
        return (
          <div className="flex flex-wrap gap-1">
            {item.roles?.map((role) => (
              <Chip key={role.id} color="primary" size="sm" variant="flat">
                {role.name}
              </Chip>
            )) || "-"}
          </div>
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
                aria-label="查看用户详情"
                className="text-lg text-default-400 active:opacity-50"
                type="button"
                onClick={() => handleView(item)}
              >
                <EyeIcon />
              </button>
            </Tooltip>
            <Tooltip content="修改">
              <button
                aria-label="编辑用户"
                className="text-lg text-default-400 active:opacity-50"
                type="button"
                onClick={() => handleEdit(item)}
              >
                <EditIcon />
              </button>
            </Tooltip>
            <Tooltip color="danger" content="删除">
              <button
                aria-label="删除用户"
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
        return (
          <span className="block max-w-[190px] truncate">
            {String(cellValue || "-")}
          </span>
        );
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
              用户管理
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              管理系统管理员、分配部门和分配对应角色权限。
            </p>
          </div>
          <Button
            className="bg-sky-600 text-white shadow-lg shadow-sky-100"
            color="primary"
            startContent={<Plus className="size-4" />}
            onPress={handleCreate}
          >
            新增用户
          </Button>
        </div>
      </section>

      <Search
        fields={searchConfig}
        onReset={handleReset}
        onSearch={handleSearch}
      />

      <div className="min-w-0 rounded-lg bg-white p-4 dark:bg-gray-800">
        <CustomTable
          ariaLabel="用户列表"
          columns={columns}
          data={userData}
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
          <ModalHeader>{editingUser ? "编辑用户" : "新增用户"}</ModalHeader>
          <ModalBody className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FileUploadField
                accept={IMAGE_UPLOAD_ACCEPT}
                folder="avatars"
                label="头像"
                value={formState.profileImage || ""}
                onChange={(url) =>
                  setFormState((prev) => ({ ...prev, profileImage: url }))
                }
              />
            </div>
            <Input
              label="用户名"
              value={formState.userName || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, userName: e.target.value }))
              }
            />
            <Input
              label="登录账号"
              value={formState.account || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, account: e.target.value }))
              }
            />
            <Input
              label={editingUser ? "新密码（留空不修改）" : "密码"}
              type="password"
              value={formState.password || ""}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
            <Select
              label="性别"
              selectedKeys={[formState.sex || "0"]}
              onSelectionChange={(keys) =>
                setFormState((prev) => ({
                  ...prev,
                  sex: String(Array.from(keys)[0]),
                }))
              }
            >
              {userSexOptions.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
            <Input
              label="手机号"
              value={formState.phoneNumber || ""}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
            />
            <Input
              label="邮箱"
              value={formState.email || ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <Select
              label="角色"
              selectedKeys={new Set(formState.roles?.map((r) => String(r.id)))}
              selectionMode="multiple"
              onSelectionChange={(keys) => {
                const selectedIds = Array.from(keys).map(Number);
                const selectedRoles = allRoles.filter((r) =>
                  selectedIds.includes(r.id),
                );

                setFormState((prev) => ({ ...prev, roles: selectedRoles }));
              }}
            >
              {allRoles.map((role) => (
                <SelectItem key={String(role.id)}>{role.name}</SelectItem>
              ))}
            </Select>
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
              {systemStatusOptions.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
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
