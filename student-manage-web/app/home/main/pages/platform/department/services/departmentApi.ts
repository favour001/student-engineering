import apiClient from "@/utils/request";
import { normalizePaginatedResponse } from "@/utils/request/pagination";

export interface DepartmentData {
  id: number;
  name: string;
  code: string;
  sortNumber: number;
  leader: string;
  phone: string;
  email: string;
  address: string;
  parentId: number;
  status: number;
  describe: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  children?: DepartmentData[];
}

export interface DepartmentListResponse {
  list: DepartmentData[];
  total: number;
}

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  code?: string;
  leader?: string;
  status?: string;
}

export const departmentApi = {
  async getDepartments(
    params: DepartmentQueryParams,
  ): Promise<DepartmentListResponse> {
    const response = await apiClient.get("/sys/department", { params });

    return normalizePaginatedResponse<DepartmentData>(response.data);
  },

  async getDepartmentById(id: number): Promise<DepartmentData> {
    const response = await apiClient.get(`/sys/department/${id}`);

    return response.data;
  },

  async getAllDepartments(): Promise<DepartmentData[]> {
    const response = await apiClient.get("/sys/department/list");

    return response.data;
  },

  async createDepartment(data: Partial<DepartmentData>): Promise<void> {
    await apiClient.post("/sys/department", data);
  },

  async updateDepartment(
    id: number,
    data: Partial<DepartmentData>,
  ): Promise<void> {
    await apiClient.patch(`/sys/department/${id}`, data);
  },

  async deleteDepartment(id: number): Promise<void> {
    await apiClient.delete(`/sys/department/${id}`);
  },

  async batchDelete(ids: number[]): Promise<void> {
    await apiClient.delete("/sys/department/batch/delete", { data: { ids } });
  },
};
