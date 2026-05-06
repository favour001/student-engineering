import { useEffect, useRef, useState } from 'react'
import Taro, { useReachBottom } from '@tarojs/taro'
import { Image, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import GraphicItem from '@/components/GraphicItem'
import Tabs from '@/components/Tabs'
import { commonRequest } from '@/utils/request'
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
  const articleLoading = useRef(false)
  const pageSize = 10

  useEffect(() => {
    async function load() {
      const bannerList = (await commonRequest<any[]>('GET', 'app/banner/list')) || []
      const quickAccessList = (await commonRequest<any[]>('GET', 'app/quick-access/list')) || []
      const noticeList = (await commonRequest<any[]>('GET', 'app/notice/list', {})) || []
      setBanners(Array.isArray(bannerList) ? bannerList : [])
      if (Array.isArray(quickAccessList) && quickAccessList.length) {
        setGrids(quickAccessList.map((item) => ({
          title: item.title,
          img: item.coverImage || item.avaterUrl || fallbackIconMap[item.title] || memberShipApplication,
          path: normalizeGridPath(item.path || item.pointUrl, item.title)
        })))
      }
      setNotice(Array.isArray(noticeList) ? noticeList[0] : undefined)
    }
    load()
  }, [])

  const loadArticles = async (nextPage = 1, append = false, nextTab = tab) => {
    if (articleLoading.current) return
    articleLoading.current = true
    try {
      const res = await commonRequest<any>('GET', 'app/article/list', {}, { pageNum: nextPage, pageSize, type: nextTab })
      const page = normalizePageResult<any>(res, nextPage, pageSize)
      setArticles((prev) => append ? prev.concat(page.list) : page.list)
      setArticlePage(nextPage)
      setArticleHasMore(page.hasMore)
    } finally {
      articleLoading.current = false
    }
  }

  useEffect(() => {
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
      <Swiper className="home-swiper" indicatorDots autoplay circular>
        {banners.map((item) => (
          <SwiperItem key={item.id}>
            <Image
              className="home-banner"
              src={item.bannerUrl || item.avaterUrl}
              mode="aspectFill"
              onClick={() => item.id && Taro.navigateTo({ url: `/pages/oAArticle/index?id=${item.id}` })}
            />
          </SwiperItem>
        ))}
      </Swiper>

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
              <Image className="grid-icon" src={item.img} mode="aspectFit" />
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
          setArticles([])
          setArticlePage(1)
          setArticleHasMore(true)
          setTab(Number(value))
        }}
      />

      <View className="common-box-2">
        {articles.length ? (
          articles.map((item) => (
            <GraphicItem
              key={item.id}
              title={item.title}
              image={item.avaterUrl}
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

function normalizeGridPath(path?: string, title?: string) {
  const value = `${path || ''}`.trim()
  if (isUrl(value) || value.startsWith('/pages/') || value.startsWith('pages/')) {
    return value
  }
  return fallbackPathMap[`${title || ''}`] || value
}
