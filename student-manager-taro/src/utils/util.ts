import { buildAssetUrl } from './request'

export const compare = <T extends Record<string, any>>(attr: keyof T, rev = true) => {
  const direction = rev ? 1 : -1
  return (a: T, b: T) => {
    if (a[attr] < b[attr]) return direction * -1
    if (a[attr] > b[attr]) return direction
    return 0
  }
}

export const getDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getDateTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  const seconds = `${date.getSeconds()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化时间字段，兼容时间戳(ms/s)、ISO 字符串、普通日期字符串
 * 输出格式: YYYY-MM-DD HH:mm
 */
export const formatTime = (val?: string | number | null): string => {
  if (!val) return ''
  let date: Date
  if (typeof val === 'number') {
    // 秒级时间戳转毫秒
    date = new Date(val < 1e12 ? val * 1000 : val)
  } else {
    date = new Date(val)
  }
  if (isNaN(date.getTime())) return String(val)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/** 判断字符串是否为 URL */
export const isUrl = (str?: string): boolean => {
  if (!str) return false
  return /^https?:\/\//i.test(str.trim())
}

export const handleImageUrl = (imageUrl = '') => {
  return buildAssetUrl(imageUrl)
}
