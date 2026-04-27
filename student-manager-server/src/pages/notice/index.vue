<template>
  <view class="notice content">
    <view class="tab-content common-box-2">
      <custom-graphics-context class="graphics-item" clickName="noticeItem" v-for="item in noticeList" :title="item.noticeTitle" :image="item.noticeUrl" :graphicsContextItem="item" :type="item.type"/>
    </view>
    <view class="footer"></view>
  </view>
</template>

<script setup lang="ts">

import CustomGraphicsContext from "@/components/custom-graphics-context.vue";
import { ref } from "vue";
import {commonRequest} from "@/utils/request";
import {onLoad} from "@dcloudio/uni-app";
import bus from '@/utils/bus'

const noticeList = ref()
const getNoticeList = async () => {
  noticeList.value = await commonRequest('GET','app/notice/list',{}) as any;
}

//跳转到文章详情
bus.on("noticeItem",({id, type}) => {
  uni.navigateTo({
    url:`/pages/notice/detail?id=${id}`
  })
})

onLoad(() => {
  getNoticeList()
})
</script>


<style lang="scss">
@import "/src/static/css/base";
</style>