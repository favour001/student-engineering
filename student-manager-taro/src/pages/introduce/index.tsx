import { useEffect, useState } from 'react'
import { Image, Text, View } from '@tarojs/components'
import HtmlContent from '@/components/HtmlContent'
import { commonRequest } from '@/utils/request'
import logo from '@/static/images/associationIntro/logo.png'
import './index.scss'

export default function Introduce() {
  const [intro, setIntro] = useState<any>({})

  useEffect(() => {
    async function load() {
      const data = await commonRequest<any>('GET', 'app/xiehui/get/1')
      setIntro(data || {})
    }
    load()
  }, [])

  return (
    <View className="common-box introduce">
      <View className="intro-head">
        <Text className="intro-title">{intro.title || '协会介绍'}</Text>
        <Image className="intro-logo" src={logo} mode="aspectFit" />
      </View>
      <HtmlContent content={intro.remark || intro.content} />
    </View>
  )
}
