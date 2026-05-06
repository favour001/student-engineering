import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { Image, ScrollView, Text, View } from '@tarojs/components'
import { commonRequest } from '@/utils/request'
import { normalizePageResult } from '@/utils/pagination'
import './index.scss'

const ALL_CATEGORY_ID = '__all__'

export default function Merchant() {
  const [categories, setCategories] = useState<any[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<string | number>(ALL_CATEGORY_ID)
  const [list, setList] = useState<any[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loading = useRef(false)
  const pageSize = 10

  const load = async (nextPage = 1, append = false, nextCategoryId = activeCategoryId) => {
    if (loading.current) return
    loading.current = true
    setLoadingMore(true)
    try {
      const data = await commonRequest<any>('GET', 'app/merchant/list', {}, {
        categoryId: nextCategoryId === ALL_CATEGORY_ID ? undefined : nextCategoryId,
        pageNum: nextPage,
        pageSize
      })
      const page = normalizePageResult<any>(data, nextPage, pageSize)
      setList((prev) => append ? prev.concat(page.list) : page.list)
      setPageNum(nextPage)
      setHasMore(page.hasMore)
    } finally {
      loading.current = false
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    async function init() {
      const rows = await commonRequest<any[]>('GET', 'app/merchant/categories', {})
      setCategories([{ id: ALL_CATEGORY_ID, name: '全部' }].concat(Array.isArray(rows) ? rows : []))
      load(1, false, ALL_CATEGORY_ID)
    }
    init()
  }, [])

  const switchCategory = (categoryId: string | number) => {
    setActiveCategoryId(categoryId)
    setList([])
    setPageNum(1)
    setHasMore(true)
    load(1, false, categoryId)
  }

  const loadNext = () => {
    if (!hasMore || loading.current) return
    load(pageNum + 1, true)
  }

  return (
    <View className="merchant-page">
      <ScrollView className="merchant-sidebar" scrollY enhanced showScrollbar={false}>
        {categories.map((item) => (
          <View
            key={item.id}
            className={`merchant-category ${`${activeCategoryId}` === `${item.id}` ? 'active' : ''}`}
            onClick={() => switchCategory(item.id)}
          >
            <Text>{item.name}</Text>
          </View>
        ))}
      </ScrollView>
      <ScrollView
        className="merchant-list"
        scrollY
        lowerThreshold={80}
        enhanced
        showScrollbar={false}
        onScrollToLower={loadNext}
      >
        <View className="merchant-list-inner">
          {list.length ? list.map((item) => (
            <View
              className="merchant-card"
              key={item.id}
              onClick={() => Taro.navigateTo({ url: `/pages/merchant/detail?id=${item.id}` })}
            >
              {item.avaterUrl ? <Image className="merchant-cover" src={item.avaterUrl} mode="aspectFit" /> : null}
              <View className="merchant-main">
                <Text className="merchant-title">{item.title}</Text>
                <Text className="merchant-summary">{stripHtml(item.remark)}</Text>
              </View>
            </View>
          )) : <View className="empty">暂无服务</View>}
          {list.length && hasMore ? <Text className="list-end">{loadingMore ? '加载中...' : '上拉加载更多'}</Text> : null}
          {list.length && !hasMore ? <Text className="list-end">没有更多了</Text> : null}
        </View>
      </ScrollView>
    </View>
  )
}

function stripHtml(value?: string) {
  return (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
