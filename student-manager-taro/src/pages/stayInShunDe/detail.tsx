import { useEffect, useState } from 'react'
import { useRouter } from '@tarojs/taro'
import CommonDetail from '@/components/CommonDetail'
import { commonRequest } from '@/utils/request'

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

  return <CommonDetail title={detail.title} time={detail.createTime} content={detail.content || detail.remark} />
}
