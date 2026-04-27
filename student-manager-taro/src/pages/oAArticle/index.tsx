import { useEffect, useState } from 'react'
import { useRouter } from '@tarojs/taro'
import { WebView, View } from '@tarojs/components'
import { commonRequest } from '@/utils/request'

export default function OAArticle() {
  const router = useRouter()
  const id = `${router.params.id || ''}`
  const [url, setUrl] = useState('')

  useEffect(() => {
    async function load() {
      if (!id) return
      const data = await commonRequest<{ pointUrl?: string }>('GET', `app/banner/info/${id}`)
      setUrl(typeof data === 'object' && data ? data.pointUrl || '' : '')
    }
    load()
  }, [id])

  return url ? <WebView src={url} /> : <View className="empty">暂无链接</View>
}
