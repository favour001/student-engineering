import { useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import { commonRequest } from '@/utils/request'
import {
  clearAuthStorage,
  getGlobalData,
  refreshAuthFromStorage,
  saveAuthStorage
} from '@/utils/app'
import avatarDefault from '@/static/images/mine/avatar.png'
import idcard from '@/static/images/mine/antOutline-idcard.png'
import gift from '@/static/images/mine/antOutline-gift.png'
import customer from '@/static/images/mine/antOutline-customer.png'
import reconciliation from '@/static/images/mine/antOutline-reconciliation.png'
import './index.scss'

const menus = [
  { name: '个人信息', icon: reconciliation, path: '/pages/profile/index' },
  { name: '我的卡包', icon: idcard, path: '/pages/cardpackage/index' },
  { name: '修改登记资料', icon: gift, path: '/pages/mineinfo/index' },
  { name: '联系客服', icon: customer, path: '/pages/customerservice/index' }
]

export default function Mine() {
  const [user, setUser] = useState<any>()
  const [loggedIn, setLoggedIn] = useState(false)

  const getUser = async (id: string, token: string) => {
    const data = await commonRequest<any>('GET', `app/wxuser/get/${id}`, { token }, {}, true).catch(() => undefined)
    if (data) setUser(data)
  }

  const restoreLoginState = () => {
    const { token, userId } = refreshAuthFromStorage()
    const hasLogin = Boolean(token && userId)
    setLoggedIn(hasLogin)
    if (hasLogin) {
      getUser(userId, token)
    } else {
      setUser(undefined)
    }
  }

  useEffect(() => {
    restoreLoginState()
  }, [])

  useDidShow(restoreLoginState)

  const login = async (event: any) => {
    if (event.detail?.errMsg !== 'getPhoneNumber:ok' || !event.detail?.code) {
      Taro.showModal({
        title: '温馨提示',
        content: '需要授权手机号后才能登录',
        showCancel: false
      })
      return
    }

    try {
      Taro.showLoading({ title: '登录中', mask: true })
      const loginRes = await Taro.login()
      const data = await commonRequest<any>('POST', 'app/wxlogin/login', {}, {
        phoneCode: event.detail.code,
        loginCode: loginRes.code
      })
      if (!data || data === true || data === false) return
      const auth = saveAuthStorage({
        token: data.token || data.accessToken || '',
        refreshToken: data.refreshToken || data.refresh_token || '',
        userId: `${data.id || ''}`
      })
      setLoggedIn(true)
      const globalData = getGlobalData()
      await getUser(auth.userId, auth.token)
      if (globalData.card.cardId) {
        const jumpUrl = `/pages/welfare/detail?cardId=${globalData.card.cardId}&type=${globalData.card.type}`
        globalData.card = { cardId: '', type: '' }
        Taro.navigateTo({ url: jumpUrl })
      }
    } catch (error) {
      console.log('wxlogin flow failed', { error })
      Taro.showModal({
        title: '温馨提示',
        content: '登录超时或网络异常，请稍后重试',
        showCancel: false
      })
    } finally {
      Taro.hideLoading()
    }
  }

  const logout = async () => {
    const result = await Taro.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？'
    })
    if (!result.confirm) return
    clearAuthStorage('manual logout')
    setLoggedIn(false)
    setUser(undefined)
    Taro.showToast({ title: '已退出登录', icon: 'none' })
  }

  return (
    <View className="mine">
      <View className="mine-header">
        <Image className="mine-avatar" src={user?.avatarUrl || user?.avatar || avatarDefault} />
        <View className="mine-user">
          <Text className="mine-name">{user?.nickName || user?.name || (loggedIn ? '已登录' : '未登录')}</Text>
          <Text className="mine-desc">{loggedIn ? '欢迎回来' : '登录后享受更多功能'}</Text>
        </View>
        {!loggedIn ? (
          <Button className="login-btn" openType="getPhoneNumber" onGetPhoneNumber={login}>
            登录
          </Button>
        ) : null}
      </View>
      <View className="mine-menu common-box-2">
        {menus.map((item) => (
          <View className="mine-menu-item" key={item.name} onClick={() => Taro.navigateTo({ url: item.path })}>
            <Image className="mine-menu-icon" src={item.icon} />
            <Text>{item.name}</Text>
          </View>
        ))}
      </View>
      {loggedIn ? (
        <Button className="logout-btn" onClick={logout}>
          退出登录
        </Button>
      ) : null}
    </View>
  )
}
