import { useEffect, useState } from 'react'
import { useRouter } from '@tarojs/taro'
import CommonDetail from '@/components/CommonDetail'
import { commonRequest } from '@/utils/request'
import { formatTime } from '@/utils/util'

export default function StayInShunDeDetail() {
  const router = useRouter()
  const id = `${router.params.id || ''}`
  const [detail, setDetail] = useState<any>({})

  useEffect(() => {
    async function load() {
      if (!id) return
      const data = await commonRequest<any>('GET', `app/tweet/get/${id}`)
      setDetail(data || {})
    }
    load()
  }, [id])

  return <CommonDetail title={detail.tweetTitle || detail.title} time={formatTime(detail.createTime)} content={detail.tweetContent || detail.content || detail.remark} />
}
