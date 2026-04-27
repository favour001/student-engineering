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

export const handleImageUrl = (imageUrl = '') => {
  return buildAssetUrl(imageUrl)
}
