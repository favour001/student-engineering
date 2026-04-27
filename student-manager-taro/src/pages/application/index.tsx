import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import HtmlContent from '@/components/HtmlContent'
import { commonRequest } from '@/utils/request'
import logo from '@/static/images/associationIntro/logo.png'
import './index.scss'

export default function Application() {
  const [application, setApplication] = useState<any>({})

  useEffect(() => {
    async function load() {
      const data = await commonRequest<any>('GET', 'app/ruhui/get/1')
      setApplication(data || {})
    }
    load()
  }, [])

  const apply = () => {
    Taro.navigateToMiniProgram({
      appId: 'wxd947200f82267e58',
      path: 'pages/wjxqList/wjxqList?activityId=hSAajeX'
    })
  }

  return (
    <View className="application">
      <View className="common-box">
        <View className="application-header">
          <Text className="application-title">{application.title}</Text>
          <Image className="application-logo" src={logo} />
        </View>
        <Text className="application-time">{application.createTime}</Text>
        <View className="application-content">
          <HtmlContent content={application.remark} />
          <Button className="primary-btn application-btn" onClick={apply}>申请入会</Button>
        </View>
      </View>
      <View className="footer" />
    </View>
  )
}
