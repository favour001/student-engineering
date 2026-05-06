import Taro from '@tarojs/taro'
import { clearAuthStorage, getGlobalData, readAuthStorage, saveAuthStorage } from './app'

declare const wx: {
  uploadFile?: (options: {
    url: string
    filePath: string
    name: string
    timeout?: number
    header?: Record<string, string>
    success?: (result: { statusCode: number; data: string }) => void
    fail?: (error: unknown) => void
  }) => void
} | undefined

export const apiOrigin = __API_ORIGIN__
export const apiPrefix = __API_PREFIX__
export const baseURL = `${apiOrigin}${apiPrefix}`
export const assetOrigin = __ASSET_ORIGIN__
const filePublicPrefix = '/image'
const requestTimeout = 15000
const assetFieldNames = new Set([
  'articleUrl',
  'avatar',
  'avatarUrl',
  'avaterUrl',
  'backgroundUrl',
  'bannerUrl',
  'certificate',
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
type RequestData = Record<string, unknown>

export async function commonRequest<T = unknown>(
  method: HttpMethod = 'GET',
  url: string,
  header: Header = {},
  data: RequestData = {},
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

  const token = header.token || readAuthStorage().token || undefined
  let res: Taro.request.SuccessCallbackResult
  try {
    res = await Taro.request({
      method,
      url: buildApiUrl(url),
      timeout: requestTimeout,
      header: {
        'content-type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}`, token } : {}),
        ...header
      },
      data: method === 'GET' ? sanitizeRequestData(data) : data
    })
  } catch (error) {
    Taro.hideLoading()
    console.log('request failed', {
      url,
      error
    })
    if (!isShowModel) {
      Taro.showModal({
        title: '温馨提示',
        content: '请求超时或网络异常，请稍后重试',
        showCancel: false
      })
    }
    return Promise.reject(error)
  }

  Taro.hideLoading()

  const result = res.data as { code: number; data?: T; msg?: string }
  if (result.code === 200) {
    return result.data === undefined ? true : normalizeAssetFields(result.data) as T
  }

  if (result.code === 401) {
    console.log('request unauthorized', {
      url,
      msg: result.msg || '',
      hasRefreshToken: Boolean(readAuthStorage().refreshToken)
    })
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return commonRequest<T>(method, url, { ...header, token: refreshed }, data, isShowModel)
    }
    clearAuthStorage(`401 refresh failed: ${url}`)
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
  const refreshToken = readAuthStorage().refreshToken
  if (!refreshToken) return ''

  console.log('refresh token start', {
    refreshTokenLength: refreshToken.length
  })
  let res: Taro.request.SuccessCallbackResult
  try {
    res = await Taro.request({
      method: 'POST',
      url: buildApiUrl('app/wxlogin/refresh'),
      timeout: requestTimeout,
      header: { 'content-type': 'application/json' },
      data: { refreshToken }
    })
  } catch (error) {
    console.log('refresh token request failed', { error })
    return ''
  }
  const result = res.data as { code: number; data?: any }
  if (result.code !== 200 || !result.data?.token) {
    console.log('refresh token failed', {
      code: result.code,
      hasToken: Boolean(result.data?.token)
    })
    return ''
  }

  const auth = saveAuthStorage({
    token: result.data.token,
    refreshToken: result.data.refreshToken || result.data.refresh_token || refreshToken,
    userId: `${result.data.id || ''}`
  })
  const globalData = getGlobalData()
  globalData.token = auth.token
  globalData.userId = auth.userId
  return auth.token
}

export function buildApiUrl(url: string) {
  const normalizedUrl = url.replace(/^\/+/, '')
  return `${baseURL}/${normalizedUrl}`
}

export async function uploadFile(filePath: string) {
  return uploadFileWithToken(filePath, readAuthStorage().token || undefined, true)
}

async function uploadFileWithToken(filePath: string, token?: string, canRefresh = true) {
  const uploadUrl = buildApiUrl('files/upload')
  console.log('upload file start', {
    url: uploadUrl,
    filePath,
    hasToken: Boolean(token)
  })

  let res: Taro.uploadFile.SuccessCallbackResult
  try {
    res = await uploadFileRequest(uploadUrl, filePath, token)
  } catch (error) {
    console.log('upload file request failed', {
      url: uploadUrl,
      error
    })
    throw error
  }

  console.log('upload file response', {
    url: uploadUrl,
    statusCode: res.statusCode,
    data: res.data
  })

  const result = parseUploadResult(res.data, {
    url: uploadUrl,
    statusCode: res.statusCode
  })

  if (result.code === 401 && canRefresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return uploadFileWithToken(filePath, refreshed, false)
    }
    clearAuthStorage(`401 refresh failed: files/upload`)
  }
  if ((result.code < 200 || result.code >= 300) || !result.data) {
    throw new Error(result.msg || '上传失败')
  }
  return normalizeUploadFileData(result.data)
}

function uploadFileRequest(uploadUrl: string, filePath: string, token?: string) {
  const header: Record<string, string> | undefined = token ? { Authorization: `Bearer ${token}`, token } : undefined
  const nativeWx = typeof wx !== 'undefined' ? wx : undefined

  if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP && typeof nativeWx?.uploadFile === 'function') {
    return new Promise<Taro.uploadFile.SuccessCallbackResult>((resolve, reject) => {
      nativeWx.uploadFile?.({
        url: uploadUrl,
        filePath,
        name: 'file',
        timeout: requestTimeout,
        header,
        success: (result) => resolve(result as Taro.uploadFile.SuccessCallbackResult),
        fail: (error) => {
          console.log('wx upload file failed', { error, uploadUrl, filePath })
          reject(error)
        }
      })
    })
  }

  return Taro.uploadFile({
    url: uploadUrl,
    filePath,
    name: 'file',
    timeout: requestTimeout,
    header
  })
}

function parseUploadResult(
  data: string,
  context: {
    url: string
    statusCode: number
  }
) {
  try {
    return JSON.parse(`${data || '{}'}`) as {
      code: number
      data?: { url?: string; previewUrl?: string; storagePath?: string }
      msg?: string
    }
  } catch (error) {
    console.log('upload file parse failed', {
      url: context.url,
      statusCode: context.statusCode,
      data,
      error
    })
    throw new Error('上传接口返回格式异常')
  }
}

function normalizeUploadFileData(data: { url?: string; previewUrl?: string; downloadUrl?: string; storagePath?: string }) {
  const normalized = normalizeAssetFields(data)
  return {
    ...normalized,
    url: buildAssetUrl(normalized.url),
    previewUrl: buildAssetUrl(normalized.previewUrl),
    downloadUrl: buildAssetUrl(normalized.downloadUrl)
  }
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
    return `${assetOrigin}${url.replace('/nsx-api', '')}`
  }
  if (url.startsWith('/image/') || url.startsWith('/uploads/') || url.startsWith(filePublicPrefix)) {
    return `${assetOrigin}${url}`
  }
  if (!url.startsWith('/')) {
    return `${assetOrigin}${filePublicPrefix}/${url}`
  }
  return `${assetOrigin}${url}`
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

function sanitizeRequestData(data: RequestData) {
  return Object.keys(data).reduce<RequestData>((result, key) => {
    const value = data[key]
    if (value === undefined || value === null || value === '') return result
    result[key] = value
    return result
  }, {})
}
