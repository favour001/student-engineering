import { useEffect, useRef, useState } from 'react'
import Taro, { useReachBottom } from '@tarojs/taro'
import { View } from '@tarojs/components'
import GraphicItem from '@/components/GraphicItem'
import Tabs from '@/components/Tabs'
import { commonRequest } from '@/utils/request'
import { normalizePageResult } from '@/utils/pagination'

export default function StayInShunDe() {
  const [categories, setCategories] = useState<any[]>([])
  const [categoryId, setCategoryId] = useState<string | number>('')
  const [list, setList] = useState<any[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loading = useRef(false)
  const pageSize = 10

  const load = async (nextPage = 1, append = false, nextCategoryId = categoryId) => {
    if (loading.current) return
    loading.current = true
    try {
      const data = await commonRequest<any>('GET', 'app/tweet/list', {}, {
        categoryId: nextCategoryId || undefined,
        pageNum: nextPage,
        pageSize
      })
      const page = normalizePageResult<any>(data, nextPage, pageSize)
      setList((prev) => append ? prev.concat(page.list) : page.list)
      setPageNum(nextPage)
      setHasMore(page.hasMore)
    } finally {
      loading.current = false
    }
  }

  useEffect(() => {
    async function init() {
      const rows = await commonRequest<any[]>('GET', 'app/content-category/list', {}, { businessKey: 'innovation-shunde' })
      const nextCategories = Array.isArray(rows) ? rows : []
      setCategories(nextCategories)
      const firstCategoryId = nextCategories[0]?.id || ''
      setCategoryId(firstCategoryId)
      load(1, false, firstCategoryId)
    }
    init()
  }, [])

  useReachBottom(() => {
    if (hasMore) load(pageNum + 1, true)
  })

  return (
    <View>
      <Tabs
        variant="scroll"
        value={categoryId}
        tabs={categories.map((item) => ({ label: item.name, value: item.id }))}
        onChange={(value) => {
          setList([])
          setPageNum(1)
          setHasMore(true)
          setCategoryId(value)
          load(1, false, value)
        }}
      />
      <View className="common-box-2">
        {list.length ? list.map((item) => (
          <GraphicItem
            key={item.id}
            title={item.title || item.tweetTitle}
            image={item.avaterUrl || item.tweetUrl || item.tweetImg}
            meta={item.createTime}
            onClick={() => Taro.navigateTo({ url: `/pages/stayInShunDe/detail?id=${item.id}` })}
          />
        )) : <View className="empty">暂无内容</View>}
      </View>
    </View>
  )
}
