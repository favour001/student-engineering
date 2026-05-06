import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import CommonDetail from '@/components/CommonDetail'
import { commonRequest } from '@/utils/request'
import { formatTime, isUrl } from '@/utils/util'

export default function ArticleDetail() {
  const router = useRouter()
  const id = `${router.params.id || ''}`
  const [detail, setDetail] = useState<any>({})

  useEffect(() => {
    async function load() {
      if (!id) return
      const data = await commonRequest<any>('GET', `app/article/get/${id}`)
      const nextDetail = data || {}
      const remark = `${nextDetail.remark || ''}`.trim()
      if (isUrl(remark)) {
        Taro.redirectTo({
          url: `/pages/oAArticle/index?url=${encodeURIComponent(remark)}&title=${encodeURIComponent(nextDetail.title || '')}`
        })
        return
      }
      setDetail(nextDetail)
    }
    load()
  }, [id])

  return <CommonDetail title={detail.title} time={formatTime(detail.createTime)} content={detail.remark || detail.content} />
}
