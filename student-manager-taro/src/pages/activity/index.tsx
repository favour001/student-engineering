import { useEffect, useRef, useState } from 'react'
import Taro, { useReachBottom } from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import { commonRequest } from '@/utils/request'
import { normalizePageResult } from '@/utils/pagination'
import activityIcon from '@/static/images/activity/activity-icon.png'
import locationIcon from '@/static/images/activity/location.png'
import './index.scss'

export default function Activity() {
  const [list, setList] = useState<any[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loading = useRef(false)
  const pageSize = 10

  const load = async (nextPage = 1, append = false) => {
    if (loading.current) return
    loading.current = true
    try {
      const data = await commonRequest<any>('GET', 'app/activity/list', {}, { pageNum: nextPage, pageSize })
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
    <View className="activity-content">
      {list.length ? list.map((item) => (
        <View className="activity-item" key={item.id}>
          <View className="activity-image" style={{ backgroundImage: item.avaterUrl ? `url(${item.avaterUrl})` : undefined }}>
            <Text className="activity-time">{(item.status === '5' ? item.endTime : item.startTime)?.split(' ')[0]?.substr(5)}</Text>
          </View>
          <View className="activity-container">
            <View className="activity-info">
              <View className="activity-base">
                <View className="activity-title">
                  <Image className="icon" src={activityIcon} />
                  <Text>{item.title}</Text>
                </View>
                <Text className="activity-font">{item.startTime?.split(' ')[0]} ~ {item.endTime?.split(' ')[0]}</Text>
                <View className="activity-font row">
                  {item.address ? <Image className="local" src={locationIcon} /> : null}
                  <Text>{item.address || '暂定'}</Text>
                </View>
                <Text className="activity-font">{item.contactName || '暂定'}</Text>
              </View>
              <Button
                className={`btn ${item.status === '5' ? 'activity-finish' : ''}`}
                onClick={() => Taro.navigateTo({ url: `/pages/activity/detail?id=${item.id}` })}
              >
                {item.status === '5' ? '已结束' : '查看'}
              </Button>
            </View>
          </View>
        </View>
      )) : <View className="empty">暂无活动</View>}
    </View>
  )
}
