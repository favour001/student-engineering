import apiClient from '@/utils/request'
import { normalizePaginatedResponse } from '@/utils/request/pagination'

export interface MenuData {
  id: number
  name: string
  code: string
  sortNumber: number
  type: number // 1:目录, 2:菜单, 3:按钮
  category: number // 1:平台, 2:项目
  icon: string
  component: string
  path: string
  permission: string
  status: number
  parentId: number | null
  describe: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  children?: MenuData[]
}

export interface MenuListResponse {
  list: MenuData[]
  total: number
}

export interface MenuQueryParams {
  page?: number
  limit?: number
  name?: string
  code?: string
  type?: string
  category?: string
  status?: string
}

export const menuApi = {
  async getMenus(params: MenuQueryParams): Promise<MenuListResponse> {
    const response = await apiClient.get('/sys/menu', { params })
    return normalizePaginatedResponse<MenuData>(response.data)
  },

  async getMenuById(id: number): Promise<MenuData> {
    const response = await apiClient.get(`/sys/menu/${id}`)
    return response.data
  },

  async getAllMenus(): Promise<MenuData[]> {
    const response = await apiClient.get('/sys/menu/list')
    return response.data
  },

  async createMenu(data: Partial<MenuData>): Promise<void> {
    await apiClient.post('/sys/menu', data)
  },

  async updateMenu(id: number, data: Partial<MenuData>): Promise<void> {
    await apiClient.patch(`/sys/menu/${id}`, data)
  },

  async deleteMenu(id: number): Promise<void> {
    await apiClient.delete(`/sys/menu/${id}`)
  },

  async batchDelete(ids: number[]): Promise<void> {
    await apiClient.delete('/sys/menu/batch/delete', { data: { ids } })
  }
}
