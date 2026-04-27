import apiClient from "@/utils/request";
import { normalizePaginatedResponse } from "@/utils/request/pagination";

export interface PostData {
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
}

export interface PostListResponse {
  list: PostData[];
  total: number;
}

export interface PostQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  code?: string;
  status?: string;
}

export const postApi = {
  async getPosts(params: PostQueryParams): Promise<PostListResponse> {
    const response = await apiClient.get("/sys/post", { params });

    return normalizePaginatedResponse<PostData>(response.data);
  },

  async getPostById(id: number): Promise<PostData> {
    const response = await apiClient.get(`/sys/post/${id}`);

    return response.data;
  },

  async createPost(data: Partial<PostData>): Promise<void> {
    await apiClient.post("/sys/post", data);
  },

  async updatePost(id: number, data: Partial<PostData>): Promise<void> {
    await apiClient.patch(`/sys/post/${id}`, data);
  },

  async deletePost(id: number): Promise<void> {
    await apiClient.delete(`/sys/post/${id}`);
  },

  async batchDelete(ids: number[]): Promise<void> {
    await apiClient.delete("/sys/post/batch/delete", { data: { ids } });
  },
};
