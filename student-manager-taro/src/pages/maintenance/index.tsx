import { View, Text } from '@tarojs/components'
import { AlertTriangle } from 'lucide-react'
import './index.scss'

export default function Maintenance() {
  return (
    <View className="maintenance-page">
      <View className="icon-wrapper">
        <AlertTriangle size={64} color="#f59e0b" />
      </View>
      <Text className="title">页面维护中</Text>
      <Text className="desc">该功能正在紧锣密鼓地开发中，敬请期待！</Text>
    </View>
  )
}
