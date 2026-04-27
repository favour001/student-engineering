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

const grids = [
  { title: '协会介绍', img: societyIntroduce, path: '/pages/introduce/index' },
  { title: '成员风采', img: memberStyle, path: '/pages/memberStyle/index' },
  { title: '入会须知', img: memberShipNotice, path: '/pages/application/index' },
  { title: '入会申请', img: memberShipApplication, path: '/pages/application/index' },
  { title: '视频', img: videoIcon, path: '/pages/video/index' }
]

export default function Home() {
  const [banners, setBanners] = useState<any[]>([])
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
      const noticeList = (await commonRequest<any[]>('GET', 'app/notice/list', {})) || []
      setBanners(Array.isArray(bannerList) ? bannerList : [])
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
    const articleUrl = `${item.articleUrl || item.content || item.contentType || ''}`.trim()
    if (isUrl(articleUrl)) {
      Taro.navigateTo({ url: `/pages/oAArticle/index?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(item.title || '')}` })
      return
    }
    Taro.navigateTo({ url: `/pages/article/index?id=${item.id}` })
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
          <View className="grid-item" key={item.title} onClick={() => Taro.navigateTo({ url: item.path })}>
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
          { label: '协会动态', value: 1 },
          { label: '政策资讯', value: 2 }
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
              summary={item.describe || item.summary}
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
