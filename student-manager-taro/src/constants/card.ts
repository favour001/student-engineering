export const CARD_TYPE = {
  VIP: '1',
  WELFARE: '2'
} as const

export const CARD_RECEIVE_STATUS = {
  RECEIVED: '1',
  PENDING: '2'
} as const

export const CARD_USE_STATUS = {
  PENDING: '1',
  USED: '2'
} as const

export const cardTypeTabs = [
  { label: '会员福利', value: Number(CARD_TYPE.VIP) },
  { label: '普惠福利', value: Number(CARD_TYPE.WELFARE) }
]

export const cardTypeLabelMap: Record<string, string> = {
  [CARD_TYPE.VIP]: '会员卡',
  [CARD_TYPE.WELFARE]: '代金券'
}

export const cardReceiveStatusLabelMap: Record<string, string> = {
  [CARD_RECEIVE_STATUS.RECEIVED]: '已领取',
  [CARD_RECEIVE_STATUS.PENDING]: '待领取'
}

export const cardUseStatusLabelMap: Record<string, string> = {
  [CARD_USE_STATUS.PENDING]: '待使用',
  [CARD_USE_STATUS.USED]: '已使用'
}
