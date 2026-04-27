import { useEffect, useRef, useState } from 'react'
import Taro, { useReachBottom } from '@tarojs/taro'
import { View } from '@tarojs/components'
import GraphicItem from '@/components/GraphicItem'
import { commonRequest } from '@/utils/request'
import { normalizePageResult } from '@/utils/pagination'

export default function Notice() {
  const [list, setList] = useState<any[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loading = useRef(false)
  const pageSize = 10

  const load = async (nextPage = 1, append = false) => {
    if (loading.current) return
    loading.current = true
    try {
      const data = await commonRequest<any>('GET', 'app/notice/list', {}, { pageNum: nextPage, pageSize })
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
        <GraphicItem
          key={item.id}
          title={item.noticeTitle}
          image={item.noticeUrl}
          meta={item.createTime}
          onClick={() => Taro.navigateTo({ url: `/pages/notice/detail?id=${item.id}` })}
        />
      )) : <View className="empty">暂无公告</View>}
    </View>
  )
}
