import Taro from '@tarojs/taro'
import type { GlobalData } from '@/app'

export const getGlobalData = () => Taro.getApp().globalData as GlobalData

export const refreshAuthFromStorage = () => {
  const globalData = getGlobalData()
  globalData.token = Taro.getStorageSync('token') || ''
  globalData.userId = Taro.getStorageSync('userId') || ''
  return globalData
}

export const clearAuthStorage = () => {
  Taro.removeStorageSync('token')
  Taro.removeStorageSync('refreshToken')
  Taro.removeStorageSync('userId')
  const globalData = getGlobalData()
  globalData.token = ''
  globalData.userId = ''
}
