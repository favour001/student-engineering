import { useEffect, useState } from 'react'
import { useRouter } from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import HtmlContent from '@/components/HtmlContent'
import { commonRequest } from '@/utils/request'
import './index.scss'

export default function MemberStyleDetail() {
  const router = useRouter()
  const id = `${router.params.id || ''}`
  const [user, setUser] = useState<any>({})

  useEffect(() => {
    async function load() {
      if (!id) return
      const data = await commonRequest<any>('GET', `app/user/get/${id}`)
      setUser(data || {})
    }
    load()
  }, [id])

  return (
    <View className="member-detail common-box">
      <Image className="member-detail-avatar" src={user.avatarUrl || user.avaterUrl} mode="aspectFill" />
      <Text className="member-detail-name">{user.nickName || user.name}</Text>
      <Text className="member-detail-line">{user.postName || user.deptName || user.company}</Text>
      <HtmlContent content={user.introduce || user.remark || user.content} />
    </View>
  )
}
