import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import HtmlContent from '@/components/HtmlContent'
import { commonRequest } from '@/utils/request'
import { getGlobalData, refreshAuthFromStorage } from '@/utils/app'
import shareIcon from '@/static/images/card/share.png'
import './detail.scss'

export default function WelfareDetail() {
  const router = useRouter()
  const [detail, setDetail] = useState<any>({})
  const [status, setStatus] = useState<any>()
  const type = `${router.params.type || '1'}`
  const cardId = `${router.params.cardId || ''}`

  const loadStatus = async (id: string) => {
    const { token, userId } = refreshAuthFromStorage()
    if (!userId) return
    const data = await commonRequest<any>('GET', `app/card/info/${id}/${userId}/${type}`, { token }, {}, true).catch(() => undefined)
    setStatus(data || undefined)
  }

  useEffect(() => {
    async function load() {
      if (!cardId) return
      const data = await commonRequest<any>('GET', `app/${type === '1' ? 'vip' : 'welfare'}/info/${cardId}`, {})
      setDetail(data || {})
      loadStatus(cardId)
    }
    load()
  }, [cardId, type])

  const receive = async () => {
    if (!status?.id) return
    await commonRequest('GET', `app/card/update/receive/${status.id}/${type}`, {})
    loadStatus(detail.id || cardId)
  }

  const useCard = async () => {
    if (!status?.id) return
    await commonRequest('GET', `app/card/update/use/${status.id}`, {})
    loadStatus(detail.id || cardId)
  }

  const goToLogin = () => {
    const globalData = getGlobalData()
    globalData.card = { cardId: detail.id || cardId, type }
    Taro.navigateTo({ url: '/pages/index/index?tab=mine' })
  }

  const start = detail.startTime ? detail.startTime.split(' ')[0] : ''
  const end = detail.endTime ? detail.endTime.split(' ')[0] : ''

  return (
    <View className="welfare-detail">
      <View className="card-detail-box">
        <View className="detail-cover" style={{ backgroundImage: detail.avaterUrl ? `url(${detail.avaterUrl})` : undefined }} />
        <Text className="detail-title">{detail.title}</Text>
        <HtmlContent content={detail.remark} />
        {start || end ? <Text className="valid-time">有效期：{start} ~ {end}</Text> : null}
        {detail.rule ? (
          <View className="rule-box">
            <Text className="section-title">使用规则</Text>
            <HtmlContent content={detail.rule} />
          </View>
        ) : null}
      </View>
      <View className="fixed-card-footer">
        <Image className="share-image" src={shareIcon} />
        {status ? (
          <>
            {status.status === '2' ? <Button className="primary-btn action-btn" onClick={receive}>领取</Button> : null}
            {type === '1' && status.status === '1' ? <Button className="primary-btn action-btn done">已领取</Button> : null}
            {type === '2' && status.status === '1' && status.useStatus === '1' ? <Button className="primary-btn action-btn" onClick={useCard}>使用</Button> : null}
            {type === '2' && status.status === '1' && status.useStatus === '2' ? <Button className="primary-btn action-btn done">已使用</Button> : null}
          </>
        ) : (
          <Button className="primary-btn action-btn" onClick={goToLogin}>领取</Button>
        )}
      </View>
    </View>
  )
}
