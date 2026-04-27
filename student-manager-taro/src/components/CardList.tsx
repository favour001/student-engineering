import Taro from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import newLabel from '@/static/images/card/new-label.png'
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
  showNewLabel?: boolean
}

export default function CardList({ list, type, target, showNewLabel = false }: Props) {
  if (!list.length) return <View className="empty">暂无卡券</View>

  return (
    <View className="card-content">
      {list.map((item, index) => {
        const title = type === 2 ? item.fuliTitle : item.vipTitle
        const image = type === 2 ? item.fuliAvaterUrl : item.vipAvaterUrl
        const cardId = item.cardId || item.id

        return (
          <View className="card-item" key={`${cardId || ''}-${index}`}>
            <View className="card-image" style={{ backgroundImage: image ? `url(${image})` : undefined }}>
              {showNewLabel ? <Image className="card-label" src={newLabel} /> : null}
            </View>
            <View className="card-footer">
              <View className="card-left">
                <Text className="card-title">{title || '卡券'}</Text>
                {type === 1 ? (
                  <Text className="card-sub-title">{item.membershipDescribe || ''}</Text>
                ) : (
                  <Text className="card-sub-title money">{item.money ? `${parseFloat(`${item.money}`)}元` : ''}</Text>
                )}
              </View>
              <View
                className="card-right"
                onClick={() => {
                  if (!cardId) return
                  Taro.navigateTo({ url: `/pages/${target}/detail?cardId=${cardId}&type=${type}` })
                }}
              >
                {item.status === '2' ? <Button className="card-btn">待领取</Button> : null}
                {item.status === '1' && type === 1 ? <Button className="card-btn done">已领取</Button> : null}
                {item.status === '1' && type === 2 && item.useStatus === '1' ? <Button className="card-btn">待使用</Button> : null}
                {item.status === '1' && type === 2 && item.useStatus === '2' ? <Button className="card-btn done">已使用</Button> : null}
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}
