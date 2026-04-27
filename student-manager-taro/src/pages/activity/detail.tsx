import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import HtmlContent from '@/components/HtmlContent'
import { commonRequest } from '@/utils/request'
import { refreshAuthFromStorage } from '@/utils/app'
import activityIcon from '@/static/images/activity/activity-icon.png'
import locationIcon from '@/static/images/activity/location.png'
import './index.scss'

export default function ActivityDetail() {
  const router = useRouter()
  const id = `${router.params.id || ''}`
  const [detail, setDetail] = useState<any>({})

  const load = async () => {
    const { userId } = refreshAuthFromStorage()
    const data = await commonRequest<any>('GET', `app/activity/get/${id}/${userId || ''}`)
    setDetail(data || {})
  }

  useEffect(() => {
    if (id) load()
  }, [id])

  const sign = async () => {
    const { token, userId } = refreshAuthFromStorage()
    if (!userId) {
      Taro.navigateTo({ url: '/pages/index/index?tab=mine' })
      return
    }
    await commonRequest('GET', `app/sign/add/${userId}/${id}`, { token })
    load()
  }

  const cancelSign = async () => {
    const { token, userId } = refreshAuthFromStorage()
    await commonRequest('DELETE', `app/sign/delete/${userId}/${id}`, { token })
    load()
  }

  return (
    <View className="activity-detail">
      <View className="activity-item">
        <View className="activity-image" style={{ backgroundImage: detail.avaterUrl ? `url(${detail.avaterUrl})` : undefined }}>
          <Text className="activity-time">{(detail.status === '5' ? detail.endTime : detail.startTime)?.split(' ')[0]?.substr(5)}</Text>
        </View>
        <View className="activity-container">
          <View className="activity-info">
            <View className="activity-base">
              <View className="activity-title">
                <Image className="icon" src={activityIcon} />
                <Text>{detail.title}</Text>
              </View>
              <Text className="activity-font">{detail.startTime?.split(' ')[0]} ~ {detail.endTime?.split(' ')[0]}</Text>
              <View className="activity-font row">
                {detail.address ? <Image className="local" src={locationIcon} /> : null}
                <Text>{detail.address || '暂定'}</Text>
              </View>
              <Text className="activity-font">联系人：{detail.contactName || '暂定'}</Text>
              <Text className="activity-font">名额：{detail.signQuota || '-'}</Text>
              <Text className="activity-font">参与对象：{detail.signType === '1' ? '协会会员' : '所有人'}</Text>
            </View>
            {detail.statusName === '报名中'
              ? <Button className="btn" onClick={sign}>报名</Button>
              : <Button className="btn activity-finish" onClick={cancelSign}>取消报名</Button>}
          </View>
        </View>
      </View>
      <View className="activity-sign common-box-2">
        <Text className="section-title">报名情况 ({detail.successNumber || 0}/{detail.signQuota || 0})</Text>
        <View className="sign-users">
          {(detail.signListVOS || []).map((item: any) => (
            <Image key={item.id || item.userId} className="sign-avatar" src={item.avatarUrl || item.avatar} />
          ))}
        </View>
      </View>
      <View className="activity-introduce common-box-2">
        <Text className="section-title">活动详情</Text>
        <HtmlContent content={detail.remark} />
      </View>
    </View>
  )
}
