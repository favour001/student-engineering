import { useEffect, useState } from 'react'
import { useRouter } from '@tarojs/taro'
import CommonDetail from '@/components/CommonDetail'
import { commonRequest } from '@/utils/request'

export default function NoticeDetail() {
  const router = useRouter()
  const id = `${router.params.id || ''}`
  const [detail, setDetail] = useState<any>({})

  useEffect(() => {
    async function load() {
      if (!id) return
      const notice = await commonRequest<any>('GET', `app/notice/get/${id}`)
      setDetail(notice || {})
    }
    load()
  }, [id])

  return (
    <CommonDetail
      title={detail.noticeTitle}
      time={detail.createTime?.split(' ')[0]}
      content={detail.remark || detail.noticeContent}
    />
  )
}
