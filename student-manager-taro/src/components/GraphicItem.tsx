import { Text, View } from '@tarojs/components'
import QueuedImage from '@/components/QueuedImage'
import { formatTime } from '@/utils/util'
import './GraphicItem.scss'

type Props = {
  title?: string
  image?: string
  summary?: string
  meta?: string
  imagePriority?: number
  onClick?: () => void
}

export default function GraphicItem({ title, image, summary, meta, imagePriority = 5, onClick }: Props) {
  return (
    <View className="graphic-item" onClick={onClick}>
      {image ? <QueuedImage className="graphic-cover" src={image} mode="aspectFill" priority={imagePriority} /> : null}
      <View className="graphic-main">
        <Text className="graphic-title">{title || '未命名'}</Text>
        {summary ? <Text className="graphic-summary">{summary}</Text> : null}
        {meta ? <Text className="graphic-meta">{formatTime(meta)}</Text> : null}
      </View>
    </View>
  )
}
