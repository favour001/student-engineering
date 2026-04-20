export type BusinessExtraFieldOption = {
  label: string
  value: string
}

export type BusinessExtraField = {
  key:
    | "startTime"
    | "endTime"
    | "address"
    | "money"
    | "contactName"
    | "contactMobile"
    | "quantity"
    | "extraType"
    | "rule"
    | "membershipDescribe"
    | "discountType"
    | "discount"
    | "relationId"
    | "userId"
    | "useStatus"
    | "userEnglishName"
    | "orderNumber"
    | "studyCountry"
    | "studySchool"
    | "major"
    | "certificate"
    | "gender"
    | "companyName"
    | "vipFlag"
    | "companyPost"
    | "companyAddress"
    | "auditStatus"
    | "socialPost"
    | "mobile"
    | "nickName"
    | "email"
    | "nativePlace"
    | "birthday"
    | "displayName"
    | "jobTitle"
    | "memberRank"
    | "backgroundImage"
    | "honorRemark"
    | "companyRemark"
    | "jobRemark"
  label: string
  type?: "text" | "number" | "datetime-local" | "textarea" | "select" | "file" | "richtext"
  options?: BusinessExtraFieldOption[]
}

export interface BusinessCategoryConfig {
  title: string
  subtitle: string
  primaryLabel: string
  secondaryLabel?: string
  summaryLabel?: string
  contentLabel?: string
  coverImageLabel?: string
  externalUrlLabel?: string
  sourceLabel?: string
  authorLabel?: string
  publishedAtLabel?: string
  enableStatus?: boolean
  summaryInputType?: "textarea" | "richtext"
  contentInputType?: "textarea" | "richtext"
  extraFields?: BusinessExtraField[]
  searchFields?: Array<{
    name: "title" | "status" | "mobile" | "nickName" | "vipFlag" | "auditStatus"
    label: string
    type: "text" | "select"
    placeholder?: string
    options?: BusinessExtraFieldOption[]
  }>
  assignment?: {
    type: "card" | "merchant"
    title: string
    assignAll?: boolean
    revokeAll?: boolean
  }
}

const yesNoOptions = [
  { label: "是", value: "1" },
  { label: "否", value: "0" },
]

export const businessCategoryConfigMap: Record<string, BusinessCategoryConfig> = {
  activity: {
    title: "活动管理",
    subtitle: "维护协会活动信息、报名规则和联系人信息。",
    primaryLabel: "活动标题",
    summaryLabel: "活动内容",
    coverImageLabel: "封面图片",
    sourceLabel: "标签名",
    authorLabel: "联系人姓名",
    extraFields: [
      { key: "startTime", label: "开始时间", type: "datetime-local" },
      { key: "endTime", label: "结束时间", type: "datetime-local" },
      { key: "address", label: "活动地址" },
      { key: "money", label: "活动金额", type: "number" },
      { key: "contactMobile", label: "联系人手机" },
      { key: "quantity", label: "报名限额", type: "number" },
      { key: "extraType", label: "报名类型" },
    ],
  },
  sign: {
    title: "活动报名",
    subtitle: "维护活动报名记录，关联报名人和活动。",
    primaryLabel: "报名人ID",
    secondaryLabel: "活动ID",
  },
  "member-style": {
    title: "成员风采",
    subtitle: "维护成员风采资料、留学背景、企业信息和社会职务展示。",
    primaryLabel: "成员姓名",
    secondaryLabel: "展示名称",
    summaryLabel: "荣誉简介",
    summaryInputType: "richtext",
    coverImageLabel: "头像地址",
    publishedAtLabel: "加入时间",
    extraFields: [
      { key: "jobTitle", label: "岗位头衔" },
      { key: "memberRank", label: "排序文案" },
      { key: "mobile", label: "手机号" },
      { key: "email", label: "邮箱" },
      {
        key: "gender",
        label: "性别",
        type: "select",
        options: [
          { label: "请选择", value: "" },
          { label: "男", value: "1" },
          { label: "女", value: "2" },
        ],
      },
      { key: "studySchool", label: "毕业院校" },
      { key: "studyCountry", label: "留学地区" },
      { key: "orderNumber", label: "旧系统排序号" },
      { key: "backgroundImage", label: "背景图", type: "file" },
      { key: "companyRemark", label: "企业信息", type: "richtext" },
      { key: "jobRemark", label: "岗位信息", type: "richtext" },
      { key: "socialPost", label: "社会职务", type: "richtext" },
    ],
  },
  "association-intro": {
    title: "协会介绍",
    subtitle: "维护协会定位、使命和组织信息。",
    primaryLabel: "介绍标题",
    summaryLabel: "介绍描述",
    summaryInputType: "richtext",
    coverImageLabel: "图片地址",
  },
  "joining-guide": {
    title: "入会须知",
    subtitle: "维护入会条件、流程与说明。",
    primaryLabel: "须知标题",
    summaryLabel: "须知描述",
    summaryInputType: "richtext",
    coverImageLabel: "图片地址",
  },
  notice: {
    title: "公告管理",
    subtitle: "集中维护协会通知、活动提醒和系统公告。",
    primaryLabel: "公告标题",
    summaryLabel: "公告内容",
    enableStatus: true,
  },
  article: {
    title: "文章管理",
    subtitle: "统一维护长内容文章与资讯专题。",
    primaryLabel: "文章标题",
    secondaryLabel: "文章类型",
    summaryLabel: "备注说明",
    contentLabel: "文章内容",
    contentInputType: "richtext",
    externalUrlLabel: "文章地址",
  },
  "innovation-shunde": {
    title: "留创顺德",
    subtitle: "维护留创顺德专题内容与展示。",
    primaryLabel: "专题标题",
    secondaryLabel: "专题类型",
    contentLabel: "专题内容",
    contentInputType: "richtext",
    coverImageLabel: "专题图片",
  },
  "study-abroad-news": {
    title: "留学资讯",
    subtitle: "维护留学政策、院校和活动资讯。",
    primaryLabel: "资讯标题",
    secondaryLabel: "内容类型",
    summaryLabel: "资讯备注",
    contentLabel: "资讯内容",
    contentInputType: "richtext",
    externalUrlLabel: "资讯地址",
    sourceLabel: "资讯类型",
  },
  video: {
    title: "视频管理",
    subtitle: "维护视频号资源、封面、发布状态和视频标识。",
    primaryLabel: "视频标题",
    summaryLabel: "视频描述",
    coverImageLabel: "封面图片",
    sourceLabel: "视频ID",
    authorLabel: "视频号ID",
    enableStatus: true,
  },
  banner: {
    title: "轮播图管理",
    subtitle: "管理首页轮播图标题、跳转地址与展示顺序。",
    primaryLabel: "轮播标题",
    coverImageLabel: "轮播图片",
    externalUrlLabel: "跳转地址",
    enableStatus: true,
  },
  "quick-access": {
    title: "金刚区管理",
    subtitle: "维护首页金刚区快捷入口的图标、描述和跳转地址。",
    primaryLabel: "入口标题",
    summaryLabel: "入口描述",
    coverImageLabel: "入口图片",
    externalUrlLabel: "跳转地址",
    enableStatus: true,
  },
  "service-platform": {
    title: "留学服务平台",
    subtitle: "维护留学服务商家内容，并支持把服务分配给微信用户。",
    primaryLabel: "平台标题",
    contentLabel: "平台内容",
    coverImageLabel: "封面图片",
    assignment: {
      type: "merchant",
      title: "分配服务用户",
      assignAll: true,
      revokeAll: true,
    },
  },
  "wechat-user": {
    title: "微信用户信息",
    subtitle: "维护微信用户档案、会员状态、审核状态和留学背景信息。",
    primaryLabel: "用户昵称",
    secondaryLabel: "微信昵称",
    summaryLabel: "会员简介",
    contentLabel: "档案信息",
    coverImageLabel: "头像地址",
    sourceLabel: "手机号",
    authorLabel: "微信 OpenID",
    publishedAtLabel: "注册日期",
    searchFields: [
      {
        name: "title",
        label: "用户昵称",
        type: "text",
        placeholder: "请输入用户昵称",
      },
      {
        name: "mobile",
        label: "手机号",
        type: "text",
        placeholder: "请输入手机号",
      },
      {
        name: "nickName",
        label: "微信昵称",
        type: "text",
        placeholder: "请输入微信昵称",
      },
      {
        name: "vipFlag",
        label: "是否会员",
        type: "select",
        options: [{ label: "全部", value: "" }, ...yesNoOptions],
      },
      {
        name: "auditStatus",
        label: "审核状态",
        type: "select",
        options: [
          { label: "全部", value: "" },
          { label: "待审核", value: "0" },
          { label: "已通过", value: "1" },
          { label: "已拒绝", value: "2" },
        ],
      },
    ],
    extraFields: [
      { key: "userEnglishName", label: "英文名" },
      { key: "orderNumber", label: "会员编号" },
      { key: "studyCountry", label: "留学国家/地区" },
      { key: "studySchool", label: "留学学校" },
      { key: "major", label: "专业/证书" },
      { key: "certificate", label: "证书地址", type: "file" },
      {
        key: "gender",
        label: "性别",
        type: "select",
        options: [
          { label: "请选择", value: "" },
          { label: "男", value: "1" },
          { label: "女", value: "2" },
        ],
      },
      { key: "companyName", label: "单位名称" },
      {
        key: "vipFlag",
        label: "是否会员",
        type: "select",
        options: [{ label: "请选择", value: "" }, ...yesNoOptions],
      },
      { key: "companyPost", label: "单位职位" },
      { key: "companyAddress", label: "单位地址" },
      {
        key: "auditStatus",
        label: "审核状态",
        type: "select",
        options: [
          { label: "请选择", value: "" },
          { label: "待审核", value: "0" },
          { label: "已通过", value: "1" },
          { label: "已拒绝", value: "2" },
        ],
      },
      { key: "socialPost", label: "社会职务" },
      { key: "email", label: "邮箱" },
      { key: "nativePlace", label: "籍贯" },
      { key: "birthday", label: "生日", type: "datetime-local" },
    ],
  },
  vip: {
    title: "会员卡管理",
    subtitle: "维护会员卡内容、权益介绍和使用时间范围。",
    primaryLabel: "会员卡标题",
    summaryLabel: "描述",
    contentLabel: "会员描述",
    coverImageLabel: "会员卡图片",
    assignment: {
      type: "card",
      title: "分配会员卡",
    },
    extraFields: [
      { key: "rule", label: "使用规则", type: "richtext" },
      { key: "startTime", label: "开始时间", type: "datetime-local" },
      { key: "endTime", label: "结束时间", type: "datetime-local" },
    ],
  },
  welfare: {
    title: "福利管理",
    subtitle: "维护福利券信息、金额折扣和使用规则。",
    primaryLabel: "福利标题",
    summaryLabel: "福利描述",
    contentLabel: "使用规则",
    contentInputType: "richtext",
    coverImageLabel: "福利图片",
    assignment: {
      type: "card",
      title: "分配福利券",
    },
    extraFields: [
      { key: "money", label: "金额", type: "number" },
      { key: "discountType", label: "折扣方式" },
      { key: "discount", label: "折扣值" },
      { key: "startTime", label: "开始时间", type: "datetime-local" },
      { key: "endTime", label: "结束时间", type: "datetime-local" },
    ],
  },
  card: {
    title: "卡包管理",
    subtitle: "维护用户持有卡券记录、状态和使用状态。",
    primaryLabel: "卡券ID",
    secondaryLabel: "用户ID",
    summaryLabel: "卡券类型",
    sourceLabel: "状态",
    extraFields: [{ key: "useStatus", label: "使用状态" }],
  },
}
