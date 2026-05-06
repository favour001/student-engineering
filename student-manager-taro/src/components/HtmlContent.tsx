import { RichText, View } from '@tarojs/components'
import './HtmlContent.scss'

type Props = {
  content?: string
}

export default function HtmlContent({ content = '' }: Props) {
  if (!content) return <View className="html-empty">暂无内容</View>

  return (
    <View className="html-content">
      <RichText nodes={normalizeRichTextImages(content)} />
    </View>
  )
}

function normalizeRichTextImages(html: string) {
  return html.replace(/<img\b([^>]*)>/gi, (_match, attrs) => {
    const cleanedAttrs = String(attrs)
      .replace(/\sstyle=(["']).*?\1/gi, '')
      .replace(/\swidth=(["']).*?\1/gi, '')
      .replace(/\sheight=(["']).*?\1/gi, '')
      .replace(/\s*\/\s*$/, '')
    return `<img${cleanedAttrs} style="max-width:100%;width:100%;height:auto;display:block;margin:12px 0;border-radius:8px;" />`
  })
}
