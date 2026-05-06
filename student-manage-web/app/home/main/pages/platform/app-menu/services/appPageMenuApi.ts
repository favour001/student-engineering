import apiClient from "@/utils/request";
import { normalizePaginatedResponse } from "@/utils/request/pagination";

export interface AppPageMenuData {
  id: number;
  name: string;
  path: string;
  icon?: string | null;
  sortNumber: number;
  status: number;
  remark?: string | null;
  createTime?: string;
  updateTime?: string;
}

export interface AppPageMenuQuery {
  page?: number;
  limit?: number;
  name?: string;
  status?: string;
}

export const appPageMenuApi = {
  async getMenus(params: AppPageMenuQuery) {
    const response = await apiClient.get("/app-page-menu", { params });
    return normalizePaginatedResponse<AppPageMenuData>(response.data);
  },

  async getActiveMenus() {
    const response = await apiClient.get("/app-page-menu/active");
    return response.data as AppPageMenuData[];
  },

  async createMenu(data: Partial<AppPageMenuData>) {
    await apiClient.post("/app-page-menu", data);
  },

  async updateMenu(id: number, data: Partial<AppPageMenuData>) {
    await apiClient.patch(`/app-page-menu/${id}`, data);
  },

  async deleteMenu(id: number) {
    await apiClient.delete(`/app-page-menu/${id}`);
  },
};
