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
      <View className="merchant-item" style={{ padding: '16px', background: '#fff', borderRadius: '8px', margin: '16px' }}>
        {detail.avaterUrl ? (
          <Image src={detail.avaterUrl} mode="widthFix" style={{ width: '100%', borderRadius: '8px' }} />
        ) : null}
        <View className="merchant-container" style={{ marginTop: '16px' }}>
          <View className="merchant-info">
            <View className="merchant-base">
              <View className="merchant-title" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                <Text>{detail.title}</Text>
              </View>
              <Text className="merchant-font" style={{ marginTop: '8px', display: 'block', color: '#999' }}>创建时间：{detail.createTime}</Text>
            </View>
          </View>
        </View>
      </View>
      <View className="merchant-introduce common-box-2">
        <Text className="section-title">服务详情</Text>
        <View style={{ overflow: 'hidden', width: '100%', wordWrap: 'break-word' }}>
          <HtmlContent content={detail.remark} />
        </View>
      </View>
    </View>
  )
}
