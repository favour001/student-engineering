import apiClient from "@/utils/request";
import { normalizePaginatedResponse } from "@/utils/request/pagination";

export interface RoleData {
  id: number;
  name: string;
  code: string;
  sortNumber: number;
  status: number;
  describe: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  menus?: Array<{ id: number; name: string }>;
}

export interface RoleListResponse {
  list: RoleData[];
  total: number;
}

export interface RoleQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  code?: string;
  status?: string;
}

export interface RoleMenuItem {
  id: number;
  name: string;
  code?: string;
  parentId?: number | null;
  sortNumber?: number;
  type?: number;
  category?: number;
  path?: string;
  status?: number;
  children?: RoleMenuItem[];
}

export const roleApi = {
  async getRoles(params: RoleQueryParams): Promise<RoleListResponse> {
    const response = await apiClient.get("/sys/role", { params });

    return normalizePaginatedResponse<RoleData>(response.data);
  },

  async getRoleById(id: number): Promise<RoleData> {
    const response = await apiClient.get(`/sys/role/${id}`);

    return response.data;
  },

  async createRole(data: Partial<RoleData>): Promise<void> {
    await apiClient.post("/sys/role", data);
  },

  async updateRole(id: number, data: Partial<RoleData>): Promise<void> {
    await apiClient.patch(`/sys/role/${id}`, data);
  },

  async deleteRole(id: number): Promise<void> {
    await apiClient.delete(`/sys/role/${id}`);
  },

  async batchDelete(ids: number[]): Promise<void> {
    await apiClient.delete("/sys/role/batch/delete", { data: { ids } });
  },

  async getRoleMenus(id: number): Promise<RoleMenuItem[]> {
    const response = await apiClient.get(`/sys/role/${id}/menus`);

    return response.data;
  },

  async assignRoleMenus(id: number, menuIds: number[]): Promise<void> {
    await apiClient.post(`/sys/role/${id}/menus`, { menuIds });
  },
};
