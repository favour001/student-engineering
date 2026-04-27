import { useEffect, useRef, useState } from 'react'
import Taro, { useReachBottom } from '@tarojs/taro'
import { View } from '@tarojs/components'
import GraphicItem from '@/components/GraphicItem'
import Tabs from '@/components/Tabs'
import { commonRequest } from '@/utils/request'
import { normalizePageResult } from '@/utils/pagination'

export default function StayInShunDe() {
  const [tweetType, setTweetType] = useState(1)
  const [list, setList] = useState<any[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loading = useRef(false)
  const pageSize = 10

  const load = async (nextPage = 1, append = false, nextType = tweetType) => {
    if (loading.current) return
    loading.current = true
    try {
      const data = await commonRequest<any>('GET', 'app/tweet/list', {}, { tweetType: nextType, pageNum: nextPage, pageSize })
      const page = normalizePageResult<any>(data, nextPage, pageSize)
      setList((prev) => append ? prev.concat(page.list) : page.list)
      setPageNum(nextPage)
      setHasMore(page.hasMore)
    } finally {
      loading.current = false
    }
  }

  useEffect(() => {
    load(1, false, tweetType)
  }, [tweetType])

  useReachBottom(() => {
    if (hasMore) load(pageNum + 1, true)
  })

  return (
    <View>
      <Tabs
        value={tweetType}
        tabs={[
          { label: '留创顺德', value: 1 },
          { label: '政策服务', value: 2 }
        ]}
        onChange={(value) => {
          setList([])
          setPageNum(1)
          setHasMore(true)
          setTweetType(Number(value))
        }}
      />
      <View className="common-box-2">
        {list.length ? list.map((item) => (
          <GraphicItem
            key={item.id}
            title={item.title || item.tweetTitle}
            image={item.avaterUrl || item.tweetUrl || item.tweetImg}
            summary={item.describe || item.tweetContent}
            meta={item.createTime}
            onClick={() => Taro.navigateTo({ url: `/pages/stayInShunDe/detail?id=${item.id}` })}
          />
        )) : <View className="empty">暂无内容</View>}
      </View>
    </View>
  )
}
