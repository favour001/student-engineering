import { Text, View } from '@tarojs/components'
import HtmlContent from './HtmlContent'
import './CommonDetail.scss'

type Props = {
  title?: string
  time?: string
  content?: string
}

export default function CommonDetail({ title, time, content }: Props) {
  return (
    <View className="common-detail common-box">
      <View className="common-detail-title">{title || '详情'}</View>
      {time ? <Text className="common-detail-time">{time}</Text> : null}
      <View className="common-detail-body">
        <HtmlContent content={content} />
      </View>
    </View>
  )
}
