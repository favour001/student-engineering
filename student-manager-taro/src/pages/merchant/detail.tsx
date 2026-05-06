import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import HtmlContent from '@/components/HtmlContent'
import { commonRequest } from '@/utils/request'
import './index.scss'

export default function MerchantDetail() {
  const router = useRouter()
  const id = `${router.params.id || ''}`
  const [detail, setDetail] = useState<any>({})

  const load = async () => {
    const data = await commonRequest<any>('GET', `app/merchant/get/${id}`)
    setDetail(data || {})
  }

  useEffect(() => {
    if (id) load()
  }, [id])

  useEffect(() => {
    if (detail.title) {
      Taro.setNavigationBarTitle({ title: detail.title })
    }
  }, [detail])

  return (
    <View className="merchant-detail">
      <View className="merchant-item">
        {detail.avaterUrl ? (
          <Image className="merchant-detail-cover" src={detail.avaterUrl} mode="widthFix" />
        ) : null}
        <View className="merchant-container">
          <View className="merchant-info">
            <View className="merchant-base">
              <View className="merchant-detail-title">
                <Text>{detail.title}</Text>
              </View>
              <Text className="merchant-font">创建时间：{detail.createTime}</Text>
            </View>
          </View>
        </View>
      </View>
      <View className="merchant-introduce common-box-2">
        <Text className="section-title">服务详情</Text>
        <View className="merchant-rich-content">
          <HtmlContent content={detail.remark} />
        </View>
      </View>
    </View>
  )
}
