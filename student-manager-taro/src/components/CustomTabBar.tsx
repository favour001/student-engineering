import { Text, View } from '@tarojs/components'
import './CustomTabBar.scss'

export const tabBarItems = [
  { text: '首页', icon: 'home' },
  { text: '会员福利', icon: 'gift' },
  { text: '留学服务', icon: 'graduation' },
  { text: '我的', icon: 'user' }
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
                <TabBarIcon name={item.icon} active={active} />
                <Text className={`custom-tabbar-text ${active ? 'active' : ''}`}>{item.text}</Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

type IconProps = {
  name: string
  active: boolean
}

function TabBarIcon({ name, active }: IconProps) {
  return (
    <View className={`custom-tabbar-icon custom-tabbar-icon-${name} ${active ? 'active' : ''}`} />
  )
}
