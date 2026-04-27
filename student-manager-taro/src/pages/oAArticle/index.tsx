import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { WebView, View } from '@tarojs/components'
import { commonRequest } from '@/utils/request'

export default function OAArticle() {
  const router = useRouter()
  const id = `${router.params.id || ''}`
  // 支持直接传入 url 参数（文章内容为链接时使用）
  const directUrl = router.params.url ? decodeURIComponent(`${router.params.url}`) : ''
  const pageTitle = router.params.title ? decodeURIComponent(`${router.params.title}`) : ''
  const [url, setUrl] = useState(directUrl)

  useEffect(() => {
    if (pageTitle) Taro.setNavigationBarTitle({ title: pageTitle })
  }, [pageTitle])

  useEffect(() => {
    if (directUrl) {
      setUrl(directUrl)
      return
    }
    async function load() {
      if (!id) return
      const data = await commonRequest<{ pointUrl?: string }>('GET', `app/banner/info/${id}`)
      setUrl(typeof data === 'object' && data ? data.pointUrl || '' : '')
    }
    load()
  }, [id, directUrl])

  return url ? <WebView src={url} /> : <View className="empty">暂无链接</View>
}
