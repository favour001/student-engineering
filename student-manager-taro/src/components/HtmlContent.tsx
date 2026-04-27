import { RichText, View } from '@tarojs/components'
import './HtmlContent.scss'

type Props = {
  content?: string
}

export default function HtmlContent({ content = '' }: Props) {
  if (!content) return <View className="html-empty">暂无内容</View>

  return (
    <View className="html-content">
      <RichText nodes={content} />
    </View>
  )
}
