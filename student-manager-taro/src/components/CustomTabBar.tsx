import { Image, Text, View } from '@tarojs/components'
import homeOff from '@/static/images/customTabBar/home_off.png'
import homeOn from '@/static/images/customTabBar/home_on.png'
import customerOff from '@/static/images/customTabBar/customer_off.png'
import customerOn from '@/static/images/customTabBar/customer_on.png'
import findOff from '@/static/images/customTabBar/find_off.png'
import findOn from '@/static/images/customTabBar/find_on.png'
import workOff from '@/static/images/customTabBar/work_off.png'
import workOn from '@/static/images/customTabBar/work_on.png'
import './CustomTabBar.scss'

export const tabBarItems = [
  { text: '首页', iconPath: homeOff, selectedIconPath: homeOn },
  { text: '福利', iconPath: customerOff, selectedIconPath: customerOn },
  { text: '活动', iconPath: findOff, selectedIconPath: findOn },
  { text: '我的', iconPath: workOff, selectedIconPath: workOn }
]

type Props = {
  activeIndex: number
  onChange: (index: number, text: string) => void
}

export default function CustomTabBar({ activeIndex, onChange }: Props) {
  return (
    <View className="custom-tabbar">
      <View className="custom-tabbar-body">
        <View className="custom-tabbar-active-bg" style={{ transform: `translateX(${activeIndex * 100}%)` }} />
        {tabBarItems.map((item, index) => {
          const active = activeIndex === index
          return (
            <View className="custom-tabbar-item" key={item.text} onClick={() => onChange(index, item.text)}>
              <View className={`custom-tabbar-item-body ${active ? 'active-body' : ''}`}>
                <Image className="custom-tabbar-icon" src={active ? item.selectedIconPath : item.iconPath} mode="aspectFit" />
                <Text className={`custom-tabbar-text ${active ? 'active' : ''}`}>{item.text}</Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
