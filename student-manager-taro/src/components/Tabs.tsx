import { ScrollView, Text, View } from '@tarojs/components'
import './Tabs.scss'

type Tab = {
  label: string
  value: string | number
}

type Props = {
  tabs: Tab[]
  value: string | number
  onChange: (value: string | number) => void
  variant?: 'default' | 'scroll'
}

export default function Tabs({ tabs, value, onChange, variant = 'default' }: Props) {
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.value === value))
  const handleChange = (nextValue: string | number) => {
    if (`${nextValue}` === `${value}`) return
    onChange(nextValue)
  }

  if (variant === 'scroll') {
    return (
      <ScrollView
        className="tabs tabs-scroll"
        scrollX
        scrollWithAnimation
        enhanced
        showScrollbar={false}
      >
        <View className="tabs-scroll-inner">
          {tabs.map((tab) => {
            const active = value === tab.value
            return (
              <View
                key={tab.value}
                className={`tabs-scroll-item ${active ? 'active' : ''}`}
                onClick={() => handleChange(tab.value)}
              >
                <Text className="tabs-scroll-label">{tab.label}</Text>
                {active && <View className="tabs-scroll-indicator" />}
              </View>
            )
          })}
        </View>
      </ScrollView>
    )
  }

  return (
    <View className="tabs">
      <View
        className="tabs-active-bg"
        style={{
          width: `calc((100% - 8px) / ${tabs.length || 1})`,
          transform: `translate3d(${activeIndex * 100}%, 0, 0)`
        }}
      />
      {tabs.map((tab) => (
        <Text
          key={tab.value}
          className={`tab-item ${value === tab.value ? 'active' : ''}`}
          onClick={() => handleChange(tab.value)}
        >
          {tab.label}
        </Text>
      ))}
    </View>
  )
}
