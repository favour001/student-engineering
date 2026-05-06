import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { Image, ScrollView, Text, View } from '@tarojs/components'
import Tabs from '@/components/Tabs'
import { CardItem } from '@/components/CardList'
import { commonRequest } from '@/utils/request'
import { refreshAuthFromStorage } from '@/utils/app'
import { normalizePageResult } from '@/utils/pagination'
import {
  CARD_RECEIVE_STATUS,
  CARD_TYPE,
  CARD_USE_STATUS,
  cardReceiveStatusLabelMap,
  cardTypeTabs,
  cardUseStatusLabelMap
} from '@/constants/card'
import './index.scss'

const ALL_CATEGORY_ID = '__all__'

export default function Welfare() {
  const [type, setType] = useState(1)
  const [categories, setCategories] = useState<any[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<string | number>(ALL_CATEGORY_ID)
  const [list, setList] = useState<CardItem[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loading = useRef(false)
  const pageSize = 10

  const load = async (
    nextPage = 1,
    append = false,
    nextType = type,
    nextCategoryId = activeCategoryId
  ) => {
    if (loading.current) return
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
      const rows = await commonRequest<any[]>('GET', `app/card/categories/${type}`, {})
      setCategories([{ id: ALL_CATEGORY_ID, name: '全部' }].concat(Array.isArray(rows) ? rows : []))
      setActiveCategoryId(ALL_CATEGORY_ID)
      setList([])
      setPageNum(1)
      setHasMore(true)
      load(1, false, type, ALL_CATEGORY_ID)
    }
    init()
  }, [type])

  const switchCategory = (categoryId: string | number) => {
    setActiveCategoryId(categoryId)
    setList([])
    setPageNum(1)
    setHasMore(true)
    load(1, false, type, categoryId)
  }

  const loadNext = () => {
    if (!hasMore || loading.current) return
    load(pageNum + 1, true)
  }

  const openDetail = (item: CardItem) => {
    const cardId = item.cardId || item.id
    if (!cardId) return
    const { userId } = refreshAuthFromStorage()
    const params = [`cardId=${cardId}`, `type=${type}`]
    if (item.id) params.push(`id=${item.id}`)
    if (userId) params.push(`userId=${userId}`)
    Taro.navigateTo({ url: `/pages/welfare/detail?${params.join('&')}` })
  }

  return (
    <View className="welfare-page">
      <Tabs
        value={type}
        tabs={cardTypeTabs}
        onChange={(value) => {
          setList([])
          setPageNum(1)
          setHasMore(true)
          setActiveCategoryId(ALL_CATEGORY_ID)
          setType(Number(value))
        }}
      />
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
              const currentType = String(type)
              const receiveStatus = String(item.status || '')
              const useStatus = String(item.useStatus || '')
              const title = currentType === CARD_TYPE.WELFARE ? item.fuliTitle : item.vipTitle
              const image = currentType === CARD_TYPE.WELFARE ? item.fuliAvaterUrl : item.vipAvaterUrl
              const desc = currentType === CARD_TYPE.WELFARE
                ? (item.money ? `${parseFloat(`${item.money}`)}元` : '普惠福利')
                : stripHtml(item.membershipDescribe)

              return (
                <View
                  className="welfare-card"
                  key={`${item.cardId || item.id || ''}-${index}`}
                  onClick={() => openDetail(item)}
                >
                  {image ? <Image className="welfare-cover" src={image} mode="aspectFit" /> : null}
                  <View className="welfare-main">
                    <Text className="welfare-title">{title || '卡券'}</Text>
                    <Text className={`welfare-summary ${currentType === CARD_TYPE.WELFARE ? 'money' : ''}`}>{desc}</Text>
                    <View className="welfare-status-row">
                      {receiveStatus === CARD_RECEIVE_STATUS.PENDING ? <Text className="welfare-status">{cardReceiveStatusLabelMap[receiveStatus]}</Text> : null}
                      {receiveStatus === CARD_RECEIVE_STATUS.RECEIVED && currentType === CARD_TYPE.VIP ? <Text className="welfare-status done">{cardReceiveStatusLabelMap[receiveStatus]}</Text> : null}
                      {receiveStatus === CARD_RECEIVE_STATUS.RECEIVED && currentType === CARD_TYPE.WELFARE && useStatus === CARD_USE_STATUS.PENDING ? <Text className="welfare-status">{cardUseStatusLabelMap[useStatus]}</Text> : null}
                      {receiveStatus === CARD_RECEIVE_STATUS.RECEIVED && currentType === CARD_TYPE.WELFARE && useStatus === CARD_USE_STATUS.USED ? <Text className="welfare-status done">{cardUseStatusLabelMap[useStatus]}</Text> : null}
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
