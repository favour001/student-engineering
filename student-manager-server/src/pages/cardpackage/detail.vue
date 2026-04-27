<template>
  <scroll-view class="scroll-view" scroll-y="true">
    <view class="welfare-detail">
      <view class="curtain"></view>
      <view class="card-detail-box">
        <view class="image" :style="{'background-image':'url('+ cardDetail.avaterUrl +')'}"></view>
        <view class="title">{{cardDetail.title}}</view>
        <view class="remark">
          <mp-html :content="cardDetail.remark"/>
        </view>
        <view class="time-rang">
          有效期：{{cardDetail.startTime.split(" ")[0]}} ~ {{cardDetail.endTime.split(" ")[0]}}
        </view>
        <view class="divider"></view>
        <view class="footer-content">
          <mp-html :content="cardDetail.rule"/>
        </view>
      </view>
      <view class="card-footer">
        <view class="card-share"></view>
        <view class="card-click-container" v-if="cardType == '1'">
          <view v-if="userId">
            <view class="card-btn" v-if="cardStatus.status == '2'" @click="cardReceive"><text>领取</text></view>
            <view class="card-btn done" v-if="cardStatus.status == '1'"><text>已领取</text></view>
          </view>
          <view v-if="!userId">
            <view class="card-btn" @click="goToLogin"><text>领取</text></view>
          </view>
        </view>
        <view class="card-click-container" v-if="cardType == '2'">
          <view v-if="userId">
            <view class="card-btn done" v-if="cardStatus.status == '2'" @click="cardReceive"><text>领取</text></view>
            <view v-if="cardStatus.status == '1'">
              <view class="card-btn" v-if="cardStatus.status == '1' && cardStatus.useStatus == '1'" @click="useCard"><text>使用</text></view>
              <view class="card-btn done" v-if="cardStatus.status == '1' && cardStatus.useStatus == '2'"><text>已使用</text></view>
            </view>
          </view>
          <view v-if="!userId">
            <view class="card-btn" @click="goToLogin"><text>领取</text></view>
          </view>
        </view>
      </view>
      <view class="safe-distance-bottom"></view>
    </view>
  </scroll-view>
</template>
<script setup lang="ts">
import {onLoad} from "@dcloudio/uni-app";
import {commonRequest} from "@/utils/request";
import {ref} from "vue";

let { token:accessToken, userId } = getApp().globalData as any
const cardDetail = ref()

const cardStatus = ref()

// const userId = ref()

const cardType = ref<any>()

const cardReceive = async () => {
  let res = await commonRequest('GET',`app/card/update/receive/${cardStatus.value.id}/${cardType.value}`, {}) as any
  if (res){
    uni.showModal({
      title: '领取成功',
      //将值设置为 success 或者直接不用写icon这个参数
      icon: 'success',
      //显示持续时间为 2秒
      duration: 2000,
      showCancel:false,
      success: (res) => {
        console.log(res)
        if (res.confirm) {
          getCardStatus(cardDetail.value.id)
        }
      }
    })
  }
}

const useCard = async () => {
  let res = await commonRequest('GET',`app/card/update/use/${cardStatus.value.id}`, {}) as any
  if (res){
    uni.showModal({
      title: '使用成功',
      //将值设置为 success 或者直接不用写icon这个参数
      icon: 'success',
      //显示持续时间为 2秒
      duration: 2000,
      showCancel:false,
      success: (res) => {
        console.log(res)
        if (res.confirm) {
          getCardStatus(cardDetail.value.id)
        }
      }
    })
  }
}

const getCardStatus = async (cardId:number) => {
  cardStatus.value = await commonRequest('GET',`app/card/info/${cardId}/${userId}/${cardType.value}`, {token:accessToken}) as any
  if (!cardStatus.value){
    uni.showToast({
      title: '温馨提示',
      content: '无法领取，请联系小秘！',
      showCancel: false
    })
  }
}

const goToLogin = () => {
  uni.showModal({
    title: '温馨提示',
    content: '请登录',
    showCancel: false,
    success: (res) => {
      if (res.confirm) {
        // getApp().tologin = '1'
        // getApp().cardId = this.data.cardId
        // getApp().type = '1'
        // getApp().cId = this.data.id
        uni.switchTab({
          url:'pages/mine/index'
        })
      }
    }
  })
}

onLoad(async (options:any) => {
  let { cardId,type } = options
  cardType.value = type
  cardDetail.value = await commonRequest('GET',`app/${type == '1' ? 'vip' : 'welfare'}/info/${cardId}`, {token:accessToken}) as any
  getCardStatus(cardId)

})
</script>

<style lang="scss">
@import "/src/static/css/base";
@import "/src/pages/welfare/cardDetail";
</style>