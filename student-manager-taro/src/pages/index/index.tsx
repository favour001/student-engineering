import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import Home from '@/pages/home'
import Welfare from '@/pages/welfare'
import Merchant from '@/pages/merchant'
import Mine from '@/pages/mine'
import CustomTabBar from '@/components/CustomTabBar'
import './index.scss'

const tabMap: Record<string, number> = {
  home: 0,
  welfare: 1,
  merchant: 2,
  mine: 3
}

export default function Index() {
  const router = useRouter()
  const initialIndex = tabMap[`${router.params.tab || 'home'}`] ?? 0
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    const text = ['首页', '会员福利', '留学服务', '我的'][currentIndex]
    Taro.setNavigationBarTitle({ title: text })
  }, [currentIndex])

  const handleTabChange = (index: number, text: string) => {
    if (index === currentIndex) return
    setCurrentIndex(index)
  }

  return (
    <View className="index-page">
      <View className="index-content">
        {currentIndex === 0 ? <Home /> : null}
        {currentIndex === 1 ? <Welfare /> : null}
        {currentIndex === 2 ? <Merchant /> : null}
        {currentIndex === 3 ? <Mine /> : null}
      </View>
      <CustomTabBar activeIndex={currentIndex} onChange={handleTabChange} />
    </View>
  )
}
