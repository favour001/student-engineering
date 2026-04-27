import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import CommonDetail from '@/components/CommonDetail'
import { commonRequest } from '@/utils/request'
import { isUrl, formatTime } from '@/utils/util'

export default function ArticleDetail() {
  const router = useRouter()
  const id = `${router.params.id || ''}`
  const [detail, setDetail] = useState<any>({})

  useEffect(() => {
    async function load() {
      if (!id) return
      const data = await commonRequest<any>('GET', `app/article/get/${id}`)
      const detail = data || {}
      // 如果文章配置的是公众号链接，用 replace 方式进入 WebView，避免返回时停在空的中间页。
      const rawContent: string = detail.articleUrl || detail.content || detail.contentType || detail.remark || ''
      if (isUrl(rawContent)) {
        Taro.redirectTo({ url: `/pages/oAArticle/index?url=${encodeURIComponent(rawContent)}&title=${encodeURIComponent(detail.title || '')}` })
        return
      }
      setDetail(detail)
    }
    load()
  }, [id])

  return <CommonDetail title={detail.title} time={formatTime(detail.createTime)} content={detail.content || detail.contentType || detail.remark} />
}
