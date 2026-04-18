import apiClient from '@/utils/request'

export interface MenuItem {
  id: number
  name: string
  code: string
  type: number // 1:目录, 2:菜单, 3:按钮
  category: number // 1:平台, 2:项目
  icon?: string
  path?: string
  component?: string
  permission?: string
  status: number
  parentId?: number | null
  sortNumber: number
  describe?: string
  children?: MenuItem[]
}

export const menuService = {
  async getUserMenus(): Promise<MenuItem[]> {
    const response = await apiClient.get('/sys/menu/user-menus')
    return response.data
  }
}
