import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import { readAuthStorage } from '@/utils/app'
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
    const auth = readAuthStorage()
    app.globalData = {
      token: auth.token,
      userId: auth.userId,
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
