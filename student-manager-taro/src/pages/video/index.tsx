import { useEffect, useRef, useState } from 'react'
import { useReachBottom } from '@tarojs/taro'
import { Video, View } from '@tarojs/components'
import { commonRequest } from '@/utils/request'
import { normalizePageResult } from '@/utils/pagination'

export default function VideoPage() {
  const [list, setList] = useState<any[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loading = useRef(false)
  const pageSize = 10

  const load = async (nextPage = 1, append = false) => {
    if (loading.current) return
    loading.current = true
    try {
      const data = await commonRequest<any>('GET', 'app/video/list', {}, { pageNum: nextPage, pageSize })
      const page = normalizePageResult<any>(data, nextPage, pageSize)
      setList((prev) => append ? prev.concat(page.list) : page.list)
      setPageNum(nextPage)
      setHasMore(page.hasMore)
    } finally {
      loading.current = false
    }
  }

  useEffect(() => {
    load()
  }, [])

  useReachBottom(() => {
    if (hasMore) load(pageNum + 1, true)
  })

  return (
    <View className="common-box-2">
      {list.length ? list.map((item) => (
        <Video
          key={item.id}
          src={item.videoUrl || item.url || item.feeldId}
          poster={item.avaterUrl}
          controls
          style={{ width: '100%', marginBottom: '12px' }}
        />
      )) : <View className="empty">暂无视频</View>}
    </View>
  )
}
