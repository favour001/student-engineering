import { View, Text } from '@tarojs/components'
import './index.scss'

export default function Maintenance() {
  return (
    <View className="maintenance-page">
      <View className="icon-wrapper">
        <Text className="icon-mark">!</Text>
      </View>
      <Text className="title">页面维护中</Text>
      <Text className="desc">该功能正在紧锣密鼓地开发中，敬请期待！</Text>
    </View>
  )
}
