import apiClient from "@/utils/request";
import { normalizePaginatedResponse } from "@/utils/request/pagination";

export interface UserData {
  id: number;
  userName: string;
  account: string;
  sex: string;
  phoneNumber: string;
  email: string;
  profileImage: string;
  status: number;
  delStatus: number;
  createTime: string;
  updateTime: string;
  roles?: Array<{ id: number; name: string }>;
  department?: { id: number; name: string };
  sysUserPosts?: Array<{ id: number; name: string }>;
}

export interface UserListResponse {
  list: UserData[];
  total: number;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  userName?: string;
  account?: string;
  phoneNumber?: string;
  status?: string;
  sex?: string;
}

export const userApi = {
  async getUsers(params: UserQueryParams): Promise<UserListResponse> {
    const response = await apiClient.get("/sys/user", { params });

    return normalizePaginatedResponse<UserData>(response.data);
  },

  async getUserById(id: number): Promise<UserData> {
    const response = await apiClient.get(`/sys/user/${id}`);

    return response.data;
  },

  async createUser(data: Partial<UserData>): Promise<void> {
    await apiClient.post("/sys/user", data);
  },

  async updateUser(id: number, data: Partial<UserData>): Promise<void> {
    await apiClient.patch(`/sys/user/${id}`, data);
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/sys/user/${id}`);
  },

  async batchDelete(ids: number[]): Promise<void> {
    await apiClient.delete("/sys/user/batch/delete", { data: { ids } });
  },

  async updateStatus(id: number, status: number): Promise<void> {
    await apiClient.put(`/sys/user/${id}/status`, { status });
  },
};
