import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function CustomerService() {
  const phone = '0757-00000000'

  return (
    <View className="service common-box">
      <Text className="service-title">联系客服</Text>
      <Text className="service-line">如需咨询活动、入会、福利卡券等问题，请联系工作人员。</Text>
      <Button className="primary-btn service-btn" onClick={() => Taro.makePhoneCall({ phoneNumber: phone })}>拨打电话</Button>
    </View>
  )
}
