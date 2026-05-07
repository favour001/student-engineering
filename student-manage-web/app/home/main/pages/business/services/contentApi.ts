import apiClient from "@/utils/request";
import { normalizePaginatedResponse } from "@/utils/request/pagination";

export interface BusinessContentItem {
  id: number;
  category: string;
  title: string;
  subTitle?: string | null;
  summary?: string | null;
  content?: string | null;
  coverImage?: string | null;
  externalUrl?: string | null;
  source?: string | null;
  author?: string | null;
  tags?: string | null;
  sortNumber: number;
  status: number;
  mobile?: string | null;
  publishedAt?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  address?: string | null;
  money?: number | null;
  contactName?: string | null;
  contactMobile?: string | null;
  quantity?: number | null;
  extraType?: string | null;
  rule?: string | null;
  membershipDescribe?: string | null;
  discountType?: string | null;
  discount?: string | null;
  relationId?: string | null;
  userId?: string | null;
  useStatus?: string | null;
  createTime?: string;
  updateTime?: string;
  userEnglishName?: string | null;
  orderNumber?: string | null;
  studyCountry?: string | null;
  studySchool?: string | null;
  major?: string | null;
  certificate?: string | null;
  gender?: string | null;
  companyName?: string | null;
  vipFlag?: string | null;
  companyPost?: string | null;
  companyAddress?: string | null;
  auditStatus?: string | null;
  socialPost?: string | null;
  nickName?: string | null;
  email?: string | null;
  nativePlace?: string | null;
  birthday?: string | null;
  displayName?: string | null;
  jobTitle?: string | null;
  postId?: number | string | null;
  postIds?: Array<number | string>;
  deptId?: number | string | null;
  deptIds?: Array<number | string>;
  awardIds?: Array<number | string>;
  awards?: Array<{ id: number; name: string }>;
  memberRank?: string | null;
  backgroundImage?: string | null;
  honorRemark?: string | null;
  companyRemark?: string | null;
  jobRemark?: string | null;
  categoryId?: number | string | null;
  cardTitle?: string | null;
  cardCoverImage?: string | null;
  cardType?: string | null;
  receiveStatus?: string | null;
  userName?: string | null;
  userNickName?: string | null;
  userMobile?: string | null;
  userAvatar?: string | null;
}

export interface BusinessCategoryOption {
  id: number;
  businessKey: string;
  name: string;
  code: string;
  sortNumber: number;
  status: number;
}

export interface BusinessContentQueryParams {
  page?: number;
  limit?: number;
  category: string;
  title?: string;
  status?: string;
  mobile?: string;
  nickName?: string;
  vipFlag?: string;
  auditStatus?: string;
  categoryId?: string;
  postId?: string;
  deptId?: string;
  awardId?: string;
}

export interface MemberAwardOption {
  id: number;
  name: string;
  sortNumber: number;
  status: number;
}

export interface BusinessAssignableUser {
  id: number;
  title: string;
  subTitle?: string | null;
  mobile?: string | null;
  coverImage?: string | null;
  userAvatar?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
  avaterUrl?: string | null;
}

export interface BusinessAssignableUserQuery {
  page?: number;
  limit?: number;
  title?: string;
  mobile?: string;
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
};

function getDomainRoute(category: string) {
  return domainRouteMap[category] || "/student-business/content";
}

export const contentApi = {
  async getList(params: BusinessContentQueryParams) {
    const response = await apiClient.get(getDomainRoute(params.category), {
      params,
    });

    return normalizePaginatedResponse<BusinessContentItem>(response.data);
  },

  async getItem(id: number, category: string) {
    const response = await apiClient.get(`${getDomainRoute(category)}/${id}`, {
      params: { category },
    });

    return response.data as BusinessContentItem;
  },

  async createItem(data: Partial<BusinessContentItem>) {
    await apiClient.post(getDomainRoute(String(data.category)), data);
  },

  async updateItem(id: number, data: Partial<BusinessContentItem>) {
    await apiClient.patch(
      `${getDomainRoute(String(data.category))}/${id}`,
      data,
    );
  },

  async deleteItem(id: number, category: string) {
    await apiClient.delete(`${getDomainRoute(category)}/${id}`, {
      params: { category },
    });
  },

  async updateStatus(id: number, category: string, status: number) {
    await apiClient.put(`${getDomainRoute(category)}/${id}/status`, {
      category,
      status,
    });
  },

  async getAssignableCardUsers(
    cardId: number,
    type: "vip" | "welfare",
    params: BusinessAssignableUserQuery,
  ) {
    const response = await apiClient.get(
      `/student-business/member/wechat-user/assignable-cards/${type}/${cardId}`,
      { params },
    );

    return normalizePaginatedResponse<BusinessAssignableUser>(response.data);
  },

  async assignCardUsers(
    cardId: number,
    type: "vip" | "welfare",
    userIds: number[],
  ) {
    await apiClient.put(
      `/student-business/member/wechat-user/assignable-cards/${type}/${cardId}`,
      { userIds },
    );
  },

  async getMemberAwards() {
    const response = await apiClient.get(
      "/student-business/member/member-style/awards",
    );

    return response.data as MemberAwardOption[];
  },

  async createMemberAward(data: Partial<MemberAwardOption>) {
    await apiClient.post("/student-business/member/member-style/awards", data);
  },

  async updateMemberAward(id: number, data: Partial<MemberAwardOption>) {
    await apiClient.patch(
      `/student-business/member/member-style/awards/${id}`,
      data,
    );
  },

  async deleteMemberAward(id: number) {
    await apiClient.delete(`/student-business/member/member-style/awards/${id}`);
  },

  async getAssignableMerchantUsers(
    merchantId: number,
    params: BusinessAssignableUserQuery,
  ) {
    const response = await apiClient.get(
      `/student-business/content/service-platform/${merchantId}/assignable-users`,
      { params },
    );

    return normalizePaginatedResponse<BusinessAssignableUser>(response.data);
  },

  async assignMerchantUsers(merchantId: number, userIds: number[]) {
    await apiClient.put(
      `/student-business/content/service-platform/${merchantId}/assign-users`,
      { userIds },
    );
  },

  async assignAllMerchantUsers(merchantId: number) {
    await apiClient.put(
      `/student-business/content/service-platform/${merchantId}/assign-all`,
    );
  },

  async revokeAllMerchantUsers(merchantId: number) {
    await apiClient.put(
      `/student-business/content/service-platform/${merchantId}/revoke-all`,
    );
  },

  async getCategories(businessKey: string) {
    const categoryRoute =
      businessKey === "vip" || businessKey === "welfare"
        ? "/student-business/benefit/categories"
        : "/student-business/content/categories";
    const response = await apiClient.get(categoryRoute, {
      params: { businessKey },
    });

    return response.data as BusinessCategoryOption[];
  },

  async createCategory(data: Partial<BusinessCategoryOption>) {
    const categoryRoute =
      data.businessKey === "vip" || data.businessKey === "welfare"
        ? "/student-business/benefit/categories"
        : "/student-business/content/categories";

    await apiClient.post(categoryRoute, data);
  },

  async updateCategory(id: number, data: Partial<BusinessCategoryOption>) {
    const categoryRoute =
      data.businessKey === "vip" || data.businessKey === "welfare"
        ? "/student-business/benefit/categories"
        : "/student-business/content/categories";

    await apiClient.patch(`${categoryRoute}/${id}`, data);
  },

  async deleteCategory(id: number, businessKey?: string) {
    const categoryRoute =
      businessKey === "vip" || businessKey === "welfare"
        ? "/student-business/benefit/categories"
        : "/student-business/content/categories";

    await apiClient.delete(`${categoryRoute}/${id}`);
  },
};
