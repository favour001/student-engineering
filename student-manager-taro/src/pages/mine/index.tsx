import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import { commonRequest } from '@/utils/request'
import { getGlobalData, refreshAuthFromStorage } from '@/utils/app'
import avatarDefault from '@/static/images/mine/avatar.png'
import idcard from '@/static/images/mine/antOutline-idcard.png'
import gift from '@/static/images/mine/antOutline-gift.png'
import customer from '@/static/images/mine/antOutline-customer.png'
import reconciliation from '@/static/images/mine/antOutline-reconciliation.png'
import './index.scss'

const menus = [
  { name: '个人档案', icon: reconciliation, path: '/pages/profile/index' },
  { name: '我的卡包', icon: idcard, path: '/pages/cardpackage/index' },
  { name: '修改登记资料', icon: gift, path: '/pages/mineinfo/index' },
  { name: '联系客服', icon: customer, path: '/pages/customerservice/index' }
]

export default function Mine() {
  const [user, setUser] = useState<any>()

  const getUser = async (id: string, token: string) => {
    const data = await commonRequest<any>('GET', `app/wxuser/get/${id}`, { token }, {}, true).catch(() => undefined)
    setUser(data)
  }

  useEffect(() => {
    const { token, userId } = refreshAuthFromStorage()
    if (token && userId) getUser(userId, token)
  }, [])

  const login = async (event: any) => {
    if (event.detail?.errMsg !== 'getPhoneNumber:ok' || !event.detail?.code) {
      Taro.showModal({
        title: '温馨提示',
        content: '需要授权手机号后才能登录',
        showCancel: false
      })
      return
    }

    Taro.showLoading({ title: '登录中', mask: true })
    const loginRes = await Taro.login()
    const data = await commonRequest<any>('POST', 'app/wxlogin/login', {}, {
      phoneCode: event.detail.code,
      loginCode: loginRes.code
    }).finally(() => Taro.hideLoading())
    if (!data || data === true || data === false) return
    Taro.setStorageSync('token', data.token || data.accessToken)
    Taro.setStorageSync('refreshToken', data.refreshToken || data.refresh_token || '')
    Taro.setStorageSync('userId', data.id)
    const globalData = getGlobalData()
    globalData.token = data.token || data.accessToken
    globalData.userId = data.id
    await getUser(data.id, data.token || data.accessToken)
    if (globalData.card.cardId) {
      const jumpUrl = `/pages/welfare/detail?cardId=${globalData.card.cardId}&type=${globalData.card.type}`
      globalData.card = { cardId: '', type: '' }
      Taro.navigateTo({ url: jumpUrl })
    }
  }

  return (
    <View className="mine">
      <View className="mine-header">
        <Image className="mine-avatar" src={user?.avatarUrl || user?.avatar || avatarDefault} />
        <View className="mine-user">
          <Text className="mine-name">{user?.nickName || user?.name || '未登录'}</Text>
          <Text className="mine-desc">{user ? '欢迎回来' : '登录后享受更多功能'}</Text>
        </View>
        {!user ? <Button className="login-btn" openType="getPhoneNumber" onGetPhoneNumber={login}>登录</Button> : null}
      </View>
      <View className="mine-menu common-box-2">
        {menus.map((item) => (
          <View className="mine-menu-item" key={item.name} onClick={() => Taro.navigateTo({ url: item.path })}>
            <Image className="mine-menu-icon" src={item.icon} />
            <Text>{item.name}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
