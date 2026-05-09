import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { Image, ScrollView, Text, View } from '@tarojs/components'
import { CardItem } from '@/components/CardList'
import { commonRequest } from '@/utils/request'
import { refreshAuthFromStorage } from '@/utils/app'
import { normalizePageResult } from '@/utils/pagination'
import {
  CARD_RECEIVE_STATUS,
  CARD_TYPE,
  cardReceiveStatusLabelMap
} from '@/constants/card'
import './index.scss'

const ALL_CATEGORY_ID = '__all__'
const MEMBER_WELFARE_TYPE = Number(CARD_TYPE.VIP)

export default function Welfare() {
  const [categories, setCategories] = useState<any[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<string | number>(ALL_CATEGORY_ID)
  const [list, setList] = useState<CardItem[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loading = useRef(false)
  const requestSeq = useRef(0)
  const activeRequest = useRef({ type: MEMBER_WELFARE_TYPE, categoryId: activeCategoryId })
  const pageSize = 10

  const load = async (
    nextPage = 1,
    append = false,
    nextType = MEMBER_WELFARE_TYPE,
    nextCategoryId = activeCategoryId
  ) => {
    if (append && loading.current) return
    const currentSeq = requestSeq.current + 1
    requestSeq.current = currentSeq
    loading.current = true
    setLoadingMore(true)
    try {
      const { token, userId } = refreshAuthFromStorage()
      const data = await commonRequest<any>('GET', `app/card/list/${nextType}/${userId}/2`, { token }, {
        categoryId: nextCategoryId === ALL_CATEGORY_ID ? undefined : nextCategoryId,
        pageNum: nextPage,
        pageSize
      })
      const page = normalizePageResult<CardItem>(data, nextPage, pageSize)
      if (
        currentSeq !== requestSeq.current ||
        nextType !== activeRequest.current.type ||
        `${nextCategoryId}` !== `${activeRequest.current.categoryId}`
      ) return
      setList((prev) => append ? prev.concat(page.list) : page.list)
      setPageNum(nextPage)
      setHasMore(page.hasMore)
    } finally {
      if (currentSeq === requestSeq.current) {
        loading.current = false
        setLoadingMore(false)
      }
    }
  }

  useEffect(() => {
    async function init() {
      const rows = await commonRequest<any[]>('GET', `app/card/categories/${MEMBER_WELFARE_TYPE}`, {})
      setCategories([{ id: ALL_CATEGORY_ID, name: '全部' }].concat(Array.isArray(rows) ? rows : []))
      activeRequest.current = { type: MEMBER_WELFARE_TYPE, categoryId: ALL_CATEGORY_ID }
      setActiveCategoryId(ALL_CATEGORY_ID)
      setList([])
      setPageNum(1)
      setHasMore(true)
      load(1, false, MEMBER_WELFARE_TYPE, ALL_CATEGORY_ID)
    }
    init()
  }, [])

  const switchCategory = (categoryId: string | number) => {
    if (`${categoryId}` === `${activeCategoryId}`) return
    activeRequest.current = { type: MEMBER_WELFARE_TYPE, categoryId }
    setActiveCategoryId(categoryId)
    setList([])
    setPageNum(1)
    setHasMore(true)
    load(1, false, MEMBER_WELFARE_TYPE, categoryId)
  }

  const loadNext = () => {
    if (!hasMore || loading.current) return
    load(pageNum + 1, true)
  }

  const openDetail = (item: CardItem) => {
    const cardId = item.cardId || item.id
    if (!cardId) return
    const { userId } = refreshAuthFromStorage()
    const params = [`cardId=${cardId}`, `type=${MEMBER_WELFARE_TYPE}`]
    if (item.id) params.push(`id=${item.id}`)
    if (userId) params.push(`userId=${userId}`)
    Taro.navigateTo({ url: `/pages/welfare/detail?${params.join('&')}` })
  }

  return (
    <View className="welfare-page">
      <View className="welfare-content">
        <ScrollView className="welfare-sidebar" scrollY enhanced showScrollbar={false}>
          {categories.map((item) => (
            <View
              key={item.id}
              className={`welfare-category ${`${activeCategoryId}` === `${item.id}` ? 'active' : ''}`}
              onClick={() => switchCategory(item.id)}
            >
              <Text>{item.name}</Text>
            </View>
          ))}
        </ScrollView>
        <ScrollView
          className="welfare-list"
          scrollY
          lowerThreshold={80}
          enhanced
          showScrollbar={false}
          onScrollToLower={loadNext}
        >
          <View className="welfare-list-inner">
            {list.length ? list.map((item, index) => {
              const receiveStatus = String(item.status || '')
              const title = item.vipTitle
              const image = item.vipAvaterUrl
              const desc = stripHtml(item.membershipDescribe)

              return (
                <View
                  className="welfare-card"
                  key={`${item.cardId || item.id || ''}-${index}`}
                  onClick={() => openDetail(item)}
                >
                  {image ? <Image className="welfare-cover" src={image} mode="aspectFit" /> : null}
                  <View className="welfare-main">
                    <Text className="welfare-title">{title || '卡券'}</Text>
                    <Text className="welfare-summary">{desc}</Text>
                    <View className="welfare-status-row">
                      {receiveStatus === CARD_RECEIVE_STATUS.PENDING ? <Text className="welfare-status">{cardReceiveStatusLabelMap[receiveStatus]}</Text> : null}
                      {receiveStatus === CARD_RECEIVE_STATUS.RECEIVED ? <Text className="welfare-status done">{cardReceiveStatusLabelMap[receiveStatus]}</Text> : null}
                    </View>
                  </View>
                </View>
              )
            }) : <View className="empty">暂无卡券</View>}
            {list.length && hasMore ? <Text className="list-end">{loadingMore ? '加载中...' : '上拉加载更多'}</Text> : null}
            {list.length && !hasMore ? <Text className="list-end">没有更多了</Text> : null}
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

function stripHtml(value?: string) {
  return (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
