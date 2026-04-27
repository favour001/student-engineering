import Taro from '@tarojs/taro'
import { clearAuthStorage, getGlobalData } from './app'

export const apiOrigin = __API_ORIGIN__
export const apiPrefix = __API_PREFIX__
export const baseURL = `${apiOrigin}${apiPrefix}`
const filePublicPrefix = '/image'
const assetFieldNames = new Set([
  'articleUrl',
  'avatar',
  'avatarUrl',
  'avaterUrl',
  'backgroundUrl',
  'bannerUrl',
  'coverImage',
  'fuliAvaterUrl',
  'noticeUrl',
  'poster',
  'profileImage',
  'tweetImg',
  'tweetUrl',
  'videoUrl',
  'vipAvaterUrl'
])
const htmlFieldNames = new Set([
  'archives',
  'content',
  'contentType',
  'informationContent',
  'remark',
  'rule',
  'tweetContent'
])

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type Header = Record<string, string | undefined>

export async function commonRequest<T = unknown>(
  method: HttpMethod = 'GET',
  url: string,
  header: Header = {},
  data: Record<string, unknown> = {},
  isShowModel = false
): Promise<T | true | false> {
  if (Object.prototype.hasOwnProperty.call(header, 'token') && !header.token) {
    Taro.hideLoading()
    Taro.showModal({
      title: '温馨提示',
      content: '登录后享受更多功能',
      showCancel: false
    })
    return false
  }

  const token = header.token || Taro.getStorageSync('token') || undefined
  const res = await Taro.request({
    method,
    url: buildApiUrl(url),
    header: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}`, token } : {}),
      ...header
    },
    data
  })

  Taro.hideLoading()

  const result = res.data as { code: number; data?: T; msg?: string }
  if (result.code === 200) {
    return result.data === undefined ? true : normalizeAssetFields(result.data) as T
  }

  if (result.code === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return commonRequest<T>(method, url, { ...header, token: refreshed }, data, isShowModel)
    }
    clearAuthStorage()
  }

  if (!isShowModel) {
    Taro.showModal({
      title: '温馨提示',
      content: result.msg || '请求失败',
      showCancel: false
    })
  }

  return Promise.reject(result)
}

async function refreshAccessToken() {
  const refreshToken = Taro.getStorageSync('refreshToken')
  if (!refreshToken) return ''

  const res = await Taro.request({
    method: 'POST',
    url: buildApiUrl('app/wxlogin/refresh'),
    header: { 'content-type': 'application/json' },
    data: { refreshToken }
  })
  const result = res.data as { code: number; data?: any }
  if (result.code !== 200 || !result.data?.token) return ''

  Taro.setStorageSync('token', result.data.token)
  Taro.setStorageSync('refreshToken', result.data.refreshToken || result.data.refresh_token || refreshToken)
  Taro.setStorageSync('userId', result.data.id)
  const globalData = getGlobalData()
  globalData.token = result.data.token
  globalData.userId = result.data.id
  return result.data.token
}

export function buildApiUrl(url: string) {
  const normalizedUrl = url.replace(/^\/+/, '')
  return `${baseURL}/${normalizedUrl}`
}

export function buildAssetUrl(url = '') {
  if (!url) return ''
  if (/^(https?:)?\/\//i.test(url) || /^(data|blob):/i.test(url)) {
    return url.replace(/\/nsx-api\/image\//, '/image/')
  }
  if (url.startsWith('/files/')) {
    return `${baseURL}${url}`
  }
  if (url.startsWith('/nsx-api/image/')) {
    return `${apiOrigin}${url.replace('/nsx-api', '')}`
  }
  if (url.startsWith('/image/') || url.startsWith('/uploads/') || url.startsWith(filePublicPrefix)) {
    return `${apiOrigin}${url}`
  }
  if (!url.startsWith('/')) {
    return `${apiOrigin}${filePublicPrefix}/${url}`
  }
  return `${apiOrigin}${url}`
}

function normalizeAssetFields<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeAssetFields(item)) as T
  }
  if (!data || typeof data !== 'object') {
    return data
  }

  const source = data as Record<string, unknown>
  const normalized: Record<string, unknown> = {}
  Object.keys(source).forEach((key) => {
    const value = source[key]
    if (typeof value === 'string' && assetFieldNames.has(key)) {
      normalized[key] = buildAssetUrl(value)
      return
    }
    if (typeof value === 'string' && htmlFieldNames.has(key)) {
      normalized[key] = normalizeHtmlAssetUrls(value)
      return
    }
    normalized[key] = normalizeAssetFields(value)
  })
  return normalized as T
}

function normalizeHtmlAssetUrls(html: string) {
  return html.replace(/(<img\b[^>]*?\bsrc=(["']))([^"']+)(\2)/gi, (_match, prefix, _quote, src, suffix) => {
    return `${prefix}${buildAssetUrl(src)}${suffix}`
  })
}
