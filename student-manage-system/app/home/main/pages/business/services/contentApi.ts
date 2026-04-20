import apiClient from "@/utils/request"
import { normalizePaginatedResponse } from "@/utils/request/pagination"

export interface BusinessContentItem {
  id: number
  category: string
  title: string
  subTitle?: string | null
  summary?: string | null
  content?: string | null
  coverImage?: string | null
  externalUrl?: string | null
  source?: string | null
  author?: string | null
  tags?: string | null
  sortNumber: number
  status: number
  mobile?: string | null
  publishedAt?: string | null
  startTime?: string | null
  endTime?: string | null
  address?: string | null
  money?: number | null
  contactName?: string | null
  contactMobile?: string | null
  quantity?: number | null
  extraType?: string | null
  rule?: string | null
  membershipDescribe?: string | null
  discountType?: string | null
  discount?: string | null
  relationId?: string | null
  userId?: string | null
  useStatus?: string | null
  createTime?: string
  updateTime?: string
  userEnglishName?: string | null
  orderNumber?: string | null
  studyCountry?: string | null
  studySchool?: string | null
  major?: string | null
  certificate?: string | null
  gender?: string | null
  companyName?: string | null
  vipFlag?: string | null
  companyPost?: string | null
  companyAddress?: string | null
  auditStatus?: string | null
  socialPost?: string | null
  nickName?: string | null
  email?: string | null
  nativePlace?: string | null
  birthday?: string | null
  displayName?: string | null
  jobTitle?: string | null
  memberRank?: string | null
  backgroundImage?: string | null
  honorRemark?: string | null
  companyRemark?: string | null
  jobRemark?: string | null
}

export interface BusinessContentQueryParams {
  page?: number
  limit?: number
  category: string
  title?: string
  status?: string
  mobile?: string
  nickName?: string
  vipFlag?: string
  auditStatus?: string
}

export interface BusinessAssignableUser {
  id: number
  title: string
  subTitle?: string | null
  mobile?: string | null
  coverImage?: string | null
}

export interface BusinessAssignableUserQuery {
  page?: number
  limit?: number
  title?: string
  mobile?: string
}

const domainRouteMap: Record<string, string> = {
  activity: "/student-business/activity",
  sign: "/student-business/activity",
  "member-style": "/student-business/member",
  "association-intro": "/student-business/member",
  "joining-guide": "/student-business/member",
  "wechat-user": "/student-business/member",
  notice: "/student-business/content",
  article: "/student-business/content",
  "innovation-shunde": "/student-business/content",
  "study-abroad-news": "/student-business/content",
  video: "/student-business/content",
  banner: "/student-business/content",
  "quick-access": "/student-business/content",
  "service-platform": "/student-business/content",
  vip: "/student-business/benefit",
  welfare: "/student-business/benefit",
  card: "/student-business/benefit",
}

function getDomainRoute(category: string) {
  return domainRouteMap[category] || "/student-business/content"
}

export const contentApi = {
  async getList(params: BusinessContentQueryParams) {
    const response = await apiClient.get(getDomainRoute(params.category), { params })
    return normalizePaginatedResponse<BusinessContentItem>(response.data)
  },

  async createItem(data: Partial<BusinessContentItem>) {
    await apiClient.post(getDomainRoute(String(data.category)), data)
  },

  async updateItem(id: number, data: Partial<BusinessContentItem>) {
    await apiClient.patch(`${getDomainRoute(String(data.category))}/${id}`, data)
  },

  async deleteItem(id: number, category: string) {
    await apiClient.delete(`${getDomainRoute(category)}/${id}`, {
      params: { category },
    })
  },

  async updateStatus(id: number, category: string, status: number) {
    await apiClient.put(`${getDomainRoute(category)}/${id}/status`, {
      category,
      status,
    })
  },

  async getAssignableCardUsers(
    cardId: number,
    type: "vip" | "welfare",
    params: BusinessAssignableUserQuery,
  ) {
    const response = await apiClient.get(
      `/student-business/member/wechat-user/assignable-cards/${type}/${cardId}`,
      { params },
    )
    return normalizePaginatedResponse<BusinessAssignableUser>(response.data)
  },

  async assignCardUsers(
    cardId: number,
    type: "vip" | "welfare",
    userIds: number[],
  ) {
    await apiClient.put(
      `/student-business/member/wechat-user/assignable-cards/${type}/${cardId}`,
      { userIds },
    )
  },

  async getAssignableMerchantUsers(
    merchantId: number,
    params: BusinessAssignableUserQuery,
  ) {
    const response = await apiClient.get(
      `/student-business/content/service-platform/${merchantId}/assignable-users`,
      { params },
    )
    return normalizePaginatedResponse<BusinessAssignableUser>(response.data)
  },

  async assignMerchantUsers(merchantId: number, userIds: number[]) {
    await apiClient.put(
      `/student-business/content/service-platform/${merchantId}/assign-users`,
      { userIds },
    )
  },

  async assignAllMerchantUsers(merchantId: number) {
    await apiClient.put(
      `/student-business/content/service-platform/${merchantId}/assign-all`,
    )
  },

  async revokeAllMerchantUsers(merchantId: number) {
    await apiClient.put(
      `/student-business/content/service-platform/${merchantId}/revoke-all`,
    )
  },
}
