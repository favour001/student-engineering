import Taro from '@tarojs/taro'
import type { GlobalData } from '@/app'

const AUTH_STORAGE_KEY = 'auth'
const TOKEN_STORAGE_KEY = 'token'
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'
const USER_ID_STORAGE_KEY = 'userId'
const LEGACY_AUTH_STORAGE_KEY = 'wx_auth'
const LEGACY_TOKEN_STORAGE_KEY = 'wx_token'
const LEGACY_REFRESH_TOKEN_STORAGE_KEY = 'wx_refreshToken'
const LEGACY_USER_ID_STORAGE_KEY = 'wx_userId'

type NativeWxStorage = {
  getStorageSync: (key: string) => unknown
  setStorageSync: (key: string, data: unknown) => void
  removeStorageSync: (key: string) => void
}

export type AuthStorage = {
  token: string
  refreshToken: string
  userId: string
}

export const getGlobalData = () => Taro.getApp().globalData as GlobalData

const getNativeWx = () => (globalThis as unknown as { wx?: NativeWxStorage }).wx

const getStorageSync = (key: string) => {
  const nativeWx = getNativeWx()
  return nativeWx ? nativeWx.getStorageSync(key) : Taro.getStorageSync(key)
}

export const setAppStorageSync = (key: string, data: unknown) => {
  const nativeWx = getNativeWx()
  if (nativeWx) {
    nativeWx.setStorageSync(key, data)
    return
  }
  Taro.setStorageSync(key, data)
}

const removeStorageSync = (key: string) => {
  const nativeWx = getNativeWx()
  if (nativeWx) {
    nativeWx.removeStorageSync(key)
    return
  }
  Taro.removeStorageSync(key)
}

export const readAuthStorage = (): AuthStorage => {
  const auth = (getStorageSync(AUTH_STORAGE_KEY) || {}) as Partial<AuthStorage>
  const legacyAuth = (getStorageSync(LEGACY_AUTH_STORAGE_KEY) || {}) as Partial<AuthStorage>
  return {
    token: auth.token || `${getStorageSync(TOKEN_STORAGE_KEY) || ''}` || legacyAuth.token || `${getStorageSync(LEGACY_TOKEN_STORAGE_KEY) || ''}`,
    refreshToken: auth.refreshToken || `${getStorageSync(REFRESH_TOKEN_STORAGE_KEY) || ''}` || legacyAuth.refreshToken || `${getStorageSync(LEGACY_REFRESH_TOKEN_STORAGE_KEY) || ''}`,
    userId: `${auth.userId || getStorageSync(USER_ID_STORAGE_KEY) || legacyAuth.userId || getStorageSync(LEGACY_USER_ID_STORAGE_KEY) || ''}`
  }
}

export const saveAuthStorage = (auth: Partial<AuthStorage>) => {
  const currentAuth = readAuthStorage()
  const nextAuth = {
    ...currentAuth,
    ...auth,
    userId: auth.userId !== undefined ? `${auth.userId}` : currentAuth.userId
  }
  setAppStorageSync(AUTH_STORAGE_KEY, nextAuth)
  setAppStorageSync(TOKEN_STORAGE_KEY, nextAuth.token)
  setAppStorageSync(REFRESH_TOKEN_STORAGE_KEY, nextAuth.refreshToken)
  setAppStorageSync(USER_ID_STORAGE_KEY, nextAuth.userId)
  removeLegacyAuthStorage()
  const globalData = getGlobalData()
  globalData.token = nextAuth.token
  globalData.userId = nextAuth.userId
  return nextAuth
}

export const refreshAuthFromStorage = () => {
  const globalData = getGlobalData()
  const auth = readAuthStorage()
  globalData.token = auth.token
  globalData.userId = auth.userId
  return globalData
}

export const clearAuthStorage = (_reason = 'unknown') => {
  removeStorageSync(AUTH_STORAGE_KEY)
  removeStorageSync(TOKEN_STORAGE_KEY)
  removeStorageSync(REFRESH_TOKEN_STORAGE_KEY)
  removeStorageSync(USER_ID_STORAGE_KEY)
  removeLegacyAuthStorage()
  const globalData = getGlobalData()
  globalData.token = ''
  globalData.userId = ''
}

const removeLegacyAuthStorage = () => {
  removeStorageSync(LEGACY_AUTH_STORAGE_KEY)
  removeStorageSync(LEGACY_TOKEN_STORAGE_KEY)
  removeStorageSync(LEGACY_REFRESH_TOKEN_STORAGE_KEY)
  removeStorageSync(LEGACY_USER_ID_STORAGE_KEY)
}
