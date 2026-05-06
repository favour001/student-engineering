import { useEffect, useState } from 'react'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import HtmlContent from '@/components/HtmlContent'
import { commonRequest } from '@/utils/request'
import { getGlobalData, refreshAuthFromStorage } from '@/utils/app'
import { formatTime } from '@/utils/util'
import {
  CARD_RECEIVE_STATUS,
  CARD_TYPE,
  CARD_USE_STATUS,
  cardReceiveStatusLabelMap,
  cardUseStatusLabelMap
} from '@/constants/card'
import './detail.scss'

export default function WelfareDetail() {
  const router = useRouter()
  const [routeParams, setRouteParams] = useState(() => ({
    type: `${router.params.type || '1'}`,
    cardId: `${router.params.cardId || router.params.id || ''}`
  }))
  const [detail, setDetail] = useState<any>({})
  const [status, setStatus] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState('')
  const type = routeParams.type
  const cardId = routeParams.cardId

  useLoad((options) => {
    setRouteParams({
      type: `${options.type || '1'}`,
      cardId: `${options.cardId || options.id || ''}`
    })
  })

  const loadStatus = async (id: string) => {
    const { userId } = refreshAuthFromStorage()
    if (!userId) return
    const data = await commonRequest<any>('GET', `app/card/info/${id}/${userId}/${type}`, {}, {}, true).catch(() => undefined)
    setStatus(data && data !== true && data !== false ? data : undefined)
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      setErrorText('')
      if (!cardId) {
        setErrorText('缺少卡券信息')
        setLoading(false)
        return
      }
      try {
        console.log('load card detail start', { cardId, type })
        const data = await commonRequest<any>('GET', `app/card/detail/${type}/${cardId}`, {}, {}, true)
        if (!data || data === true || data === false) {
          setErrorText('卡券不存在')
          return
        }
        setDetail(data || {})
        loadStatus(cardId)
      } catch (error) {
        console.log('load card detail failed', { cardId, type, error })
        setErrorText('详情加载失败')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [cardId, type])

  const receive = async () => {
    const { userId } = refreshAuthFromStorage()
    if (!userId) {
      goToLogin()
      return
    }
    await commonRequest('POST', 'app/card/receive', {}, { cardId: detail.id || cardId, userId, type })
    Taro.showToast({ title: '领取成功', icon: 'none' })
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

  const start = formatDate(detail.startTime)
  const end = formatDate(detail.endTime)
  const validTime = start || end ? `${start || '不限'} 至 ${end || '不限'}` : '长期有效'
  const receiveStatus = String(status?.status || '')
  const useStatus = String(status?.useStatus || '')

  if (loading) {
    return (
      <View className="welfare-detail">
        <View className="detail-state">加载中...</View>
      </View>
    )
  }

  if (errorText) {
    return (
      <View className="welfare-detail">
        <View className="detail-state">{errorText}</View>
      </View>
    )
  }

  return (
    <View className="welfare-detail">
      <View className="card-detail-box">
        {detail.avaterUrl ? <Image className="detail-cover" src={detail.avaterUrl} mode="aspectFit" /> : null}
        <View className="detail-main">
          <Text className="detail-title">{detail.title || '卡券详情'}</Text>
          <View className="detail-meta-row">
            <Text className="detail-meta-label">有效期</Text>
            <Text className="detail-meta-value">{validTime}</Text>
          </View>
          {detail.createTime ? (
            <View className="detail-meta-row">
              <Text className="detail-meta-label">发布时间</Text>
              <Text className="detail-meta-value">{formatTime(detail.createTime)}</Text>
            </View>
          ) : null}
        </View>
        {detail.remark ? (
          <View className="detail-section">
            <Text className="section-title">权益说明</Text>
            <HtmlContent content={detail.remark} />
          </View>
        ) : null}
        {detail.rule ? (
          <View className="detail-section">
            <Text className="section-title">使用规则</Text>
            <HtmlContent content={detail.rule} />
          </View>
        ) : null}
      </View>
      <View className="fixed-card-footer">
        <Button className="share-btn" openType="share">分享</Button>
        {status ? (
          <>
            {receiveStatus === CARD_RECEIVE_STATUS.PENDING ? <Button className="primary-btn action-btn" onClick={receive}>点击领取</Button> : null}
            {type === CARD_TYPE.VIP && receiveStatus === CARD_RECEIVE_STATUS.RECEIVED ? <Button className="primary-btn action-btn done">{cardReceiveStatusLabelMap[receiveStatus]}</Button> : null}
            {type === CARD_TYPE.WELFARE && receiveStatus === CARD_RECEIVE_STATUS.RECEIVED && useStatus === CARD_USE_STATUS.PENDING ? <Button className="primary-btn action-btn" onClick={useCard}>点击使用</Button> : null}
            {type === CARD_TYPE.WELFARE && receiveStatus === CARD_RECEIVE_STATUS.RECEIVED && useStatus === CARD_USE_STATUS.USED ? <Button className="primary-btn action-btn done">{cardUseStatusLabelMap[useStatus]}</Button> : null}
          </>
        ) : (
          <Button className="primary-btn action-btn" onClick={receive}>点击领取</Button>
        )}
      </View>
    </View>
  )
}

function formatDate(value?: string | number | null) {
  const text = formatTime(value)
  return text ? text.slice(0, 10) : ''
}
