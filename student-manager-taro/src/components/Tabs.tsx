import { Text, View } from '@tarojs/components'
import './Tabs.scss'

type Tab = {
  label: string
  value: string | number
}

type Props = {
  tabs: Tab[]
  value: string | number
  onChange: (value: string | number) => void
}

export default function Tabs({ tabs, value, onChange }: Props) {
  return (
    <View className="tabs">
      {tabs.map((tab) => (
        <Text
          key={tab.value}
          className={`tab-item ${value === tab.value ? 'active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </Text>
      ))}
    </View>
  )
}
