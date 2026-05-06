import Taro from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import { refreshAuthFromStorage } from '@/utils/app'
import { CARD_RECEIVE_STATUS, CARD_TYPE, CARD_USE_STATUS, cardReceiveStatusLabelMap, cardUseStatusLabelMap } from '@/constants/card'
import './CardList.scss'

export type CardItem = {
  cardId?: string
  id?: string
  status?: string
  useStatus?: string
  type?: string
  vipTitle?: string
  fuliTitle?: string
  membershipDescribe?: string
  money?: string | number
  vipAvaterUrl?: string
  fuliAvaterUrl?: string
}

type Props = {
  list: CardItem[]
  type: number
  target: 'welfare' | 'cardpackage'
}

export default function CardList({ list, type, target }: Props) {
  if (!list.length) return <View className="empty">暂无卡券</View>

  return (
    <View className="card-content">
      {list.map((item, index) => {
        const currentType = String(type)
        const receiveStatus = String(item.status || '')
        const useStatus = String(item.useStatus || '')
        const title = currentType === CARD_TYPE.WELFARE ? item.fuliTitle : item.vipTitle
        const image = currentType === CARD_TYPE.WELFARE ? item.fuliAvaterUrl : item.vipAvaterUrl
        const cardId = item.cardId || item.id
        const openDetail = () => {
          if (!cardId) return
          const { userId } = refreshAuthFromStorage()
          const params = [`cardId=${cardId}`, `type=${type}`]
          if (item.id) params.push(`id=${item.id}`)
          if (userId) params.push(`userId=${userId}`)
          Taro.navigateTo({ url: `/pages/${target}/detail?${params.join('&')}` })
        }

        return (
          <View className="card-item" key={`${cardId || ''}-${index}`} onClick={openDetail}>
            <Image className="card-image" src={image || ''} mode="aspectFit" />
            <View className="card-footer">
              <View className="card-left">
                <Text className="card-title">{title || '卡券'}</Text>
                {currentType === CARD_TYPE.VIP ? (
                  <Text className="card-sub-title">{item.membershipDescribe || ''}</Text>
                ) : (
                  <Text className="card-sub-title money">{item.money ? `${parseFloat(`${item.money}`)}元` : ''}</Text>
                )}
              </View>
              <View className="card-right">
                {receiveStatus === CARD_RECEIVE_STATUS.PENDING ? <Button className="card-btn">{cardReceiveStatusLabelMap[receiveStatus]}</Button> : null}
                {receiveStatus === CARD_RECEIVE_STATUS.RECEIVED && currentType === CARD_TYPE.VIP ? <Button className="card-btn done">{cardReceiveStatusLabelMap[receiveStatus]}</Button> : null}
                {receiveStatus === CARD_RECEIVE_STATUS.RECEIVED && currentType === CARD_TYPE.WELFARE && useStatus === CARD_USE_STATUS.PENDING ? <Button className="card-btn">{cardUseStatusLabelMap[useStatus]}</Button> : null}
                {receiveStatus === CARD_RECEIVE_STATUS.RECEIVED && currentType === CARD_TYPE.WELFARE && useStatus === CARD_USE_STATUS.USED ? <Button className="card-btn done">{cardUseStatusLabelMap[useStatus]}</Button> : null}
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}
