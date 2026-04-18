import { proxy } from 'valtio'

export interface UserInfo {
  id: number
  userName: string
  account: string
  email?: string
  phoneNumber?: string
  profileImage?: string
}

export interface MenuItem {
  id: number
  name: string
  code: string
  type: number
  category: number
  sortNumber?: number
  icon?: string
  path?: string
  component?: string
  permission?: string
  parentId?: number | null
  children?: MenuItem[]
}

export interface AppState {
  pageDomain: {
    home: {
      uiDomain: {
        layout: {
          leftSidebar: {
            logo: {}
            userInfo: UserInfo | null
            menu: {
              platform: MenuItem[]
              project: MenuItem[]
            }
          }
          rightSidebar: {
            header: {}
          }
        }
      }
    }
    login: {
      userId: number | null
    }
  }
}

export const appStore = proxy<AppState>({
  pageDomain: {
    home: {
      uiDomain: {
        layout: {
          leftSidebar: {
            logo: {},
            userInfo: null,
            menu: {
              platform: [],
              project: []
            }
          },
          rightSidebar: {
            header: {}
          }
        }
      }
    },
    login: {
      userId: null
    }
  }
})
