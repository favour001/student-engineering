<template>
  <view class="card-package">
    <view class="curtain"></view>
    <uni-segmented-control class="tab" :current="tab.current" :values="tab.items" :style-type="tab.styleType"
                           :active-color="tab.activeColor" :default-color="tab.defaultColor" @clickItem="onClickItem" />
    <view class="card-content">
      <view class="card-item" v-for="(item,index) in tab.cardList" :key="index">
        <view class="card-image" :style="{'background-image':`url(${tab.current ? item.fuliAvaterUrl : item.vipAvaterUrl})`}"></view>
        <view class="card-footer">
          <view class="card-left">
            <view class="card-title">{{tab.current ? item.fuliTitle : item.vipTitle }}</view>
            <view class="card-sub-title" v-if="tab.current == 0">{{ item.membershipDescribe }}</view>
            <view class="card-sub-title money" v-if="tab.current == 1">{{ parseFloat(item.money) }}元</view>
          </view>
          <view class="card-right" @click="hrefPage(item.cardId)">
            <button class="card-btn done" v-if="item.status == '1' && item.type == '1'">已领取</button>
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
import {onMounted, reactive} from 'vue'
import UniSegmentedControl from "@/components/uni-segmented-control.vue";
import newLabel from "@/static/images/card/new-label.png"
import { commonRequest } from '@/utils/request'

let { token:accessToken, userId } = getApp().globalData as any

interface Card{
  vipAvaterUrl:string,
  vipTitle:string,
  membershipDescribe:string,
  status:string
}

interface Tab{
  items:string[],
  styleType:string,
  activeColor:string,
  current:number,
  total:number,
  defaultColor:string,
  loadStatus:string,
  cardList:Card[],
}

//分段器
const tab = reactive<Tab>({
  items: ['会员卡', '代金劵'],
  styleType: "text",
  activeColor:"#fff",
  current:0,
  cardList:[],
  defaultColor:"#fcca00",
  total:0,
  loadStatus:'more'
})

const hrefPage = (cardId:string) => {
  uni.navigateTo({
    url:`/pages/cardpackage/detail?cardId=${cardId}&type=${tab.current ? 2 : 1}`
  })
}

const onClickItem = (e:any) => {
  if (tab.current !== e.currentIndex) {
    tab.current = e.currentIndex
    getCardList()
  }
}

const getCardList = async () => {
  tab.cardList = await commonRequest('GET',`app/card/list/${tab.current ? 2 : 1}/${userId}/1`,{token:accessToken}) as any;
}

onMounted(() => {
  getCardList()
})
</script>
<style lang="scss">
@import "/src/static/css/base";
@import "/src/pages/welfare/card";
</style>