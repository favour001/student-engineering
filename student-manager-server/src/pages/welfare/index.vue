<template>
    <view class="welfare">
      <uni-segmented-control class="tab" :current="tab.current" :values="tab.items" :style-type="tab.styleType"
                             :active-color="tab.activeColor" :default-color="tab.defaultColor" @clickItem="onClickItem"/>
      <view class="card-content">
        <view class="card-item" v-for="(item,index) in tab.cardList" :key="index">
          <view class="card-image" :style="{'background-image':`url(${tab.current ? item.fuliAvaterUrl : item.vipAvaterUrl})`}">
            <image class="card-label" src="../../static/images/card/new-label.png"></image>
          </view>
          <view class="card-footer">
            <view class="card-left">
              <view class="card-title">{{tab.current ? item.fuliTitle : item.vipTitle }}</view>
              <view class="card-sub-title" v-if="tab.current == 0">{{ item.membershipDescribe }}</view>
              <view class="card-sub-title money" v-if="tab.current == 1">{{ parseFloat(item.money) }}元</view>
            </view>
            <view class="card-right" @click="hrefPage(item.cardId)">
              <button class="card-btn" v-if="item.status == '2'">待领取</button>
              <view v-if="item.status == '1'">
                <button class="card-btn" v-if="item.useStatus == '1'">待使用</button>
                <button class="card-btn done" v-if="item.useStatus == '2'">已使用</button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue'
import UniSegmentedControl from "@/components/uni-segmented-control.vue";
import {commonRequest} from "@/utils/request";
//分段器
const tab = reactive({
  items: ['会员卡', '代金券'],
  styleType: "text",
  activeColor:"#fff",
  current:0,
  cardList:[],
  defaultColor:"#fcca00",
  total:0,
  loadStatus:'more'
})

const cardList = ref()

let { token:accessToken, userId } = getApp().globalData as any
const getCardList = async () => {
  tab.cardList = await commonRequest('GET',`app/card/list/${tab.current ? 2 : 1}/${userId}/2`, {token:accessToken}) as any;
}

const hrefPage = (cardId:string) => {
  uni.navigateTo({
    url:`/pages/welfare/detail?cardId=${cardId}&type=${tab.current ? 2 : 1}`
  })
}

const onClickItem = (e:any) => {
  if (tab.current !== e.currentIndex) {
    tab.current = e.currentIndex
    getCardList()
  }
}

onMounted(() => {
  getCardList()
})
</script>

<style lang="scss">
@import "/src/static/css/base";
@import "card";
</style>