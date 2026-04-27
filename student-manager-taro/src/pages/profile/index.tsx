import { useEffect, useState } from 'react'
import { Image, Text, View } from '@tarojs/components'
import { commonRequest } from '@/utils/request'
import { refreshAuthFromStorage } from '@/utils/app'
import avatarDefault from '@/static/images/mine/avatar.png'
import './index.scss'

export default function Profile() {
  const [user, setUser] = useState<any>({})

  useEffect(() => {
    async function load() {
      const { token, userId } = refreshAuthFromStorage()
      if (!userId) return
      const data = await commonRequest<any>('GET', `app/wxuser/get/${userId}`, { token })
      setUser(data || {})
    }
    load()
  }, [])

  const rows = [
    ['姓名', user.name || user.nickName],
    ['电话', user.phone],
    ['单位', user.company],
    ['职务', user.postName],
    ['部门', user.deptName]
  ]

  return (
    <View className="profile common-box">
      <Image className="profile-avatar" src={user.avatarUrl || user.avatar || avatarDefault} />
      {rows.map(([label, value]) => (
        <View className="profile-row" key={label}>
          <Text className="profile-label">{label}</Text>
          <Text className="profile-value">{value || '-'}</Text>
        </View>
      ))}
    </View>
  )
}
