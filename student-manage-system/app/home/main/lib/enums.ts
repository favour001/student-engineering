export type EnumOption = {
  label: string
  value: string
}

export type EnumChipTone = "success" | "danger" | "warning" | "primary" | "secondary" | "default"

export type EnumChipConfig = {
  label: string
  color: EnumChipTone
}

function toLabelMap(options: EnumOption[]) {
  return Object.fromEntries(options.map((item) => [item.value, item.label])) as Record<string, string>
}

function toChipMap(
  options: Array<EnumOption & { color?: EnumChipTone }>,
  fallbackColor: EnumChipTone = "default",
) {
  return Object.fromEntries(
    options.map((item) => [
      item.value,
      { label: item.label, color: item.color || fallbackColor },
    ]),
  ) as Record<string, EnumChipConfig>
}

export const systemStatusOptions: EnumOption[] = [
  { label: "正常", value: "0" },
  { label: "禁用", value: "1" },
]

export const systemStatusSearchOptions: EnumOption[] = [
  { label: "全部", value: "" },
  ...systemStatusOptions,
]

export const systemStatusLabelMap = toLabelMap(systemStatusOptions)

export const systemStatusChipMap = toChipMap(
  [
    { label: "正常", value: "0", color: "success" },
    { label: "禁用", value: "1", color: "danger" },
  ],
  "warning",
)

export const businessContentStatusOptions: EnumOption[] = [
  { label: "启用", value: "0" },
  { label: "禁用", value: "1" },
]

export const businessContentStatusSearchOptions: EnumOption[] = [
  { label: "全部", value: "" },
  ...businessContentStatusOptions,
]

export const businessContentStatusChipMap = toChipMap([
  { label: "启用", value: "0", color: "success" },
  { label: "禁用", value: "1", color: "danger" },
])

export const userSexOptions: EnumOption[] = [
  { label: "男", value: "0" },
  { label: "女", value: "1" },
]

export const userSexSearchOptions: EnumOption[] = [
  { label: "全部", value: "" },
  ...userSexOptions,
]

export const userSexLabelMap = toLabelMap(userSexOptions)

export const userDeleteStatusOptions: EnumOption[] = [
  { label: "禁止删除", value: "0" },
  { label: "允许删除", value: "1" },
]

export const menuTypeOptions: EnumOption[] = [
  { label: "目录", value: "1" },
  { label: "菜单", value: "2" },
  { label: "按钮", value: "3" },
]

export const menuTypeSearchOptions: EnumOption[] = [
  { label: "全部", value: "" },
  ...menuTypeOptions,
]

export const menuTypeLabelMap = toLabelMap(menuTypeOptions)

export const menuTypeChipMap = toChipMap([
  { label: "目录", value: "1", color: "primary" },
  { label: "菜单", value: "2", color: "secondary" },
  { label: "按钮", value: "3", color: "default" },
])

export const menuCategoryOptions: EnumOption[] = [
  { label: "平台", value: "1" },
  { label: "项目", value: "2" },
]

export const menuCategorySearchOptions: EnumOption[] = [
  { label: "全部", value: "" },
  ...menuCategoryOptions,
]

export const menuCategoryLabelMap = toLabelMap(menuCategoryOptions)

export const yesNoOptions: EnumOption[] = [
  { label: "是", value: "1" },
  { label: "否", value: "0" },
]

export const yesNoSearchOptions: EnumOption[] = [
  { label: "全部", value: "" },
  ...yesNoOptions,
]

export const yesNoLabelMap = toLabelMap(yesNoOptions)

export const genderOptions: EnumOption[] = [
  { label: "请选择", value: "" },
  { label: "男", value: "1" },
  { label: "女", value: "2" },
  { label: "未知", value: "3" },
]

export const genderSearchOptions: EnumOption[] = [
  { label: "全部", value: "" },
  ...genderOptions.filter((item) => item.value !== ""),
]

export const genderLabelMap = toLabelMap(genderOptions.filter((item) => item.value !== ""))

export const auditStatusOptions: EnumOption[] = [
  { label: "请选择", value: "" },
  { label: "待审核", value: "0" },
  { label: "已通过", value: "1" },
  { label: "已拒绝", value: "2" },
]

export const auditStatusSearchOptions: EnumOption[] = [
  { label: "全部", value: "" },
  ...auditStatusOptions.filter((item) => item.value !== ""),
]

export const auditStatusLabelMap = toLabelMap(
  auditStatusOptions.filter((item) => item.value !== ""),
)

export const cardUseStatusOptions: EnumOption[] = [
  { label: "请选择", value: "" },
  { label: "待使用", value: "1" },
  { label: "已使用", value: "2" },
]

export const cardUseStatusLabelMap = toLabelMap(
  cardUseStatusOptions.filter((item) => item.value !== ""),
)

export const cardTypeOptions: EnumOption[] = [
  { label: "会员卡", value: "1" },
  { label: "代金券", value: "2" },
]

export const cardTypeLabelMap = toLabelMap(cardTypeOptions)

export const cardReceiveStatusOptions: EnumOption[] = [
  { label: "已领取", value: "1" },
  { label: "待领取", value: "2" },
]

export const cardReceiveStatusLabelMap = toLabelMap(cardReceiveStatusOptions)

export const welfareDiscountTypeOptions: EnumOption[] = [
  { label: "按金额", value: "1" },
  { label: "按折扣", value: "2" },
]

export const welfareDiscountTypeLabelMap = toLabelMap(welfareDiscountTypeOptions)

export const activityStatusOptions: EnumOption[] = [
  { label: "待发布", value: "1" },
  { label: "报名中", value: "2" },
  { label: "人员已满", value: "3" },
  { label: "活动进行中", value: "4" },
  { label: "活动已结束", value: "5" },
]

export const activityStatusLabelMap = toLabelMap(activityStatusOptions)

export const tweetTypeOptions: EnumOption[] = [
  { label: "人才政策", value: "1" },
  { label: "留创园信息", value: "2" },
  { label: "创新创业扶持政策", value: "3" },
  { label: "人才招聘", value: "4" },
  { label: "项目合作", value: "5" },
]

export const tweetTypeLabelMap = toLabelMap(tweetTypeOptions)

export const articleTypeOptions: EnumOption[] = [
  { label: "总会动态", value: "1" },
  { label: "海外分会动态", value: "2" },
]

export const articleTypeLabelMap = toLabelMap(articleTypeOptions)

export const enumLabelMaps = {
  systemStatus: systemStatusLabelMap,
  userSex: userSexLabelMap,
  userDeleteStatus: toLabelMap(userDeleteStatusOptions),
  menuType: menuTypeLabelMap,
  menuCategory: menuCategoryLabelMap,
  yesNo: yesNoLabelMap,
  gender: genderLabelMap,
  auditStatus: auditStatusLabelMap,
  useStatus: cardUseStatusLabelMap,
  cardType: cardTypeLabelMap,
  cardReceiveStatus: cardReceiveStatusLabelMap,
  welfareDiscountType: welfareDiscountTypeLabelMap,
  activityStatus: activityStatusLabelMap,
  tweetType: tweetTypeLabelMap,
  articleType: articleTypeLabelMap,
}
