import { useEffect, useRef, useState } from 'react'
import Taro, { useReachBottom } from '@tarojs/taro'
import { Image, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import GraphicItem from '@/components/GraphicItem'
import QueuedImage from '@/components/QueuedImage'
import Tabs from '@/components/Tabs'
import { buildOptimizedImageUrl, commonRequest } from '@/utils/request'
import { normalizePageResult } from '@/utils/pagination'
import { isUrl } from '@/utils/util'
import memberStyle from '@/static/images/jingangDistrict/memberstyle.png'
import memberShipNotice from '@/static/images/jingangDistrict/membershipnotice.png'
import memberShipApplication from '@/static/images/jingangDistrict/membershipapplication.png'
import societyIntroduce from '@/static/images/jingangDistrict/societyintroduce.png'
import videoIcon from '@/static/images/jingangDistrict/video.png'
import './index.scss'

const defaultGrids = [
  { title: '协会介绍', img: societyIntroduce, path: '/pages/introduce/index' },
  { title: '成员风采', img: memberStyle, path: '/pages/memberStyle/index' },
  { title: '留创顺德', img: memberShipNotice, path: '/pages/stayInShunDe/index' },
  { title: '入会申请', img: memberShipApplication, path: '/pages/application/index' }
]

const fallbackIconMap: Record<string, string> = {
  协会介绍: societyIntroduce,
  成员风采: memberStyle,
  留创顺德: memberShipNotice,
  入会申请: memberShipApplication,
  视频: videoIcon
}

const fallbackPathMap: Record<string, string> = {
  协会介绍: '/pages/introduce/index',
  成员风采: '/pages/memberStyle/index',
  留创顺德: '/pages/stayInShunDe/index',
  入会申请: '/pages/application/index',
  视频: '/pages/video/index'
}

export default function Home() {
  const [banners, setBanners] = useState<any[]>([])
  const [grids, setGrids] = useState(defaultGrids)
  const [notice, setNotice] = useState<any>()
  const [tab, setTab] = useState(1)
  const [articles, setArticles] = useState<any[]>([])
  const [articlePage, setArticlePage] = useState(1)
  const [articleHasMore, setArticleHasMore] = useState(true)
  const [homeLoading, setHomeLoading] = useState(true)
  const [articleInitialLoading, setArticleInitialLoading] = useState(true)
  const articleLoading = useRef(false)
  const articleRequestSeq = useRef(0)
  const activeArticleTab = useRef(tab)
  const pageSize = 10

  useEffect(() => {
    async function load() {
      try {
        const bannerList = (await commonRequest<any[]>('GET', 'app/banner/list')) || []
        const quickAccessList = (await commonRequest<any[]>('GET', 'app/quick-access/list')) || []
        const noticeList = (await commonRequest<any[]>('GET', 'app/notice/list', {})) || []
        setBanners(Array.isArray(bannerList) ? bannerList : [])
        if (Array.isArray(quickAccessList) && quickAccessList.length) {
          setGrids(quickAccessList.map((item) => ({
            title: item.title,
            img: optimizeHomeImage(item.coverImage || item.avaterUrl || fallbackIconMap[item.title] || memberShipApplication, 160),
            path: normalizeGridPath(item.path || item.pointUrl, item.title)
          })))
        }
        setNotice(Array.isArray(noticeList) ? noticeList[0] : undefined)
      } finally {
        setHomeLoading(false)
      }
    }
    load()
  }, [])

  const loadArticles = async (nextPage = 1, append = false, nextTab = tab) => {
    if (append && articleLoading.current) return
    const requestSeq = articleRequestSeq.current + 1
    articleRequestSeq.current = requestSeq
    articleLoading.current = true
    if (!append && !articles.length) setArticleInitialLoading(true)
    try {
      const res = await commonRequest<any>('GET', 'app/article/list', {}, { pageNum: nextPage, pageSize, type: nextTab })
      const page = normalizePageResult<any>(res, nextPage, pageSize)
      if (requestSeq !== articleRequestSeq.current || nextTab !== activeArticleTab.current) {
        return
      }
      setArticles((prev) => append ? prev.concat(page.list) : page.list)
      setArticlePage(nextPage)
      setArticleHasMore(page.hasMore)
    } finally {
      if (requestSeq === articleRequestSeq.current) {
        if (!append) setArticleInitialLoading(false)
        articleLoading.current = false
      }
    }
  }

  useEffect(() => {
    activeArticleTab.current = tab
    loadArticles(1, false, tab)
  }, [tab])

  useReachBottom(() => {
    if (articleHasMore) loadArticles(articlePage + 1, true)
  })

  const openArticle = (item: any) => {
    Taro.navigateTo({ url: `/pages/article/index?id=${item.id}` })
  }

  const handleGridClick = (path: string) => {
    if (!path) {
      Taro.navigateTo({ url: '/pages/maintenance/index' })
      return
    }
    if (isUrl(path)) {
      Taro.navigateTo({
        url: `/pages/oAArticle/index?url=${encodeURIComponent(path)}`
      })
      return
    }
    const targetPath = path.startsWith('/') ? path : `/${path}`
    Taro.navigateTo({ url: targetPath }).catch(() => {
      Taro.navigateTo({ url: '/pages/maintenance/index' })
    })
  }

  return (
    <View className="home content">
      {homeLoading && !banners.length ? (
        <View className="home-swiper home-skeleton" />
      ) : (
        <Swiper className="home-swiper" indicatorDots autoplay circular>
          {banners.map((item) => (
            <SwiperItem key={item.id}>
              <QueuedImage
                className="home-banner"
                src={optimizeHomeImage(item.bannerUrl || item.avaterUrl, 750)}
                mode="aspectFill"
                priority={1}
                lazyLoad={false}
                onClick={() => item.id && Taro.navigateTo({ url: `/pages/oAArticle/index?id=${item.id}` })}
              />
            </SwiperItem>
          ))}
        </Swiper>
      )}

      {notice ? (
        <View className="notice" onClick={() => Taro.navigateTo({ url: '/pages/notice/index' })}>
          <Text className="notice-label">公告</Text>
          <Text className="notice-text">{notice.noticeTitle}</Text>
        </View>
      ) : null}

      <View className="grid common-box-2">
        {grids.map((item) => (
          <View className="grid-item" key={item.title} onClick={() => handleGridClick(item.path)}>
            <View className="grid-icon-wrap">
              <QueuedImage className="grid-icon" src={item.img} mode="aspectFit" priority={2} />
            </View>
            <Text className="grid-title">{item.title}</Text>
          </View>
        ))}
      </View>

      <Tabs
        value={tab}
        tabs={[
          { label: '总会动态', value: 1 },
          { label: '海外动态', value: 2 }
        ]}
        onChange={(value) => {
          const nextTab = Number(value)
          if (nextTab === tab) return
          activeArticleTab.current = nextTab
          setArticles([])
          setArticlePage(1)
          setArticleHasMore(true)
          setTab(nextTab)
        }}
      />

      <View className="common-box-2">
        {articleInitialLoading && !articles.length ? (
          <View>
            {[1, 2, 3].map((item) => (
              <View className="article-skeleton" key={item}>
                <View className="article-skeleton-cover home-skeleton" />
                <View className="article-skeleton-main">
                  <View className="article-skeleton-line home-skeleton" />
                  <View className="article-skeleton-line short home-skeleton" />
                  <View className="article-skeleton-meta home-skeleton" />
                </View>
              </View>
            ))}
          </View>
        ) : articles.length ? (
          articles.map((item) => (
            <GraphicItem
              key={item.id}
              title={item.title}
              image={optimizeHomeImage(item.avaterUrl, 320)}
              imagePriority={3}
              meta={item.createTime}
              onClick={() => openArticle(item)}
            />
          ))
        ) : (
          <View className="empty">暂无文章</View>
        )}
      </View>
    </View>
  )
}

function optimizeHomeImage(url?: string, width = 480) {
  if (!url) return ''
  return buildOptimizedImageUrl(url, width, resolveHomeImageQuality(width))
}

function resolveHomeImageQuality(width: number) {
  if (width <= 160) return 75
  if (width <= 320) return 76
  if (width >= 1080) return 82
  return 78
}

function normalizeGridPath(path?: string, title?: string) {
  const value = `${path || ''}`.trim()
  if (isUrl(value) || value.startsWith('/pages/') || value.startsWith('pages/')) {
    return value
  }
  return fallbackPathMap[`${title || ''}`] || value
}
