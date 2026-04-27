import { Image, Text, View } from '@tarojs/components'
import { formatTime } from '@/utils/util'
import './GraphicItem.scss'

type Props = {
  title?: string
  image?: string
  summary?: string
  meta?: string
  onClick?: () => void
}

export default function GraphicItem({ title, image, summary, meta, onClick }: Props) {
  return (
    <View className="graphic-item" onClick={onClick}>
      {image ? <Image className="graphic-cover" src={image} mode="aspectFill" /> : null}
      <View className="graphic-main">
        <Text className="graphic-title">{title || '未命名'}</Text>
        {summary ? <Text className="graphic-summary">{summary}</Text> : null}
        {meta ? <Text className="graphic-meta">{formatTime(meta)}</Text> : null}
      </View>
    </View>
  )
}
