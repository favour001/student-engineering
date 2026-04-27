import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import './app.scss'

export type GlobalData = {
  token: string
  userId: string
  toLogin: boolean
  card: {
    cardId: string
    type: string
  }
}

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    const app = Taro.getApp()
    app.globalData = {
      token: Taro.getStorageSync('token') || '',
      userId: Taro.getStorageSync('userId') || '',
      toLogin: true,
      card: {
        cardId: '',
        type: ''
      }
    } satisfies GlobalData
  })

  return children
}

export default App
