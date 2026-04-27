<template>
  <view class="article">
    <view class="curtain"></view>
    <custom-common-detail :title="noticeDetail.noticeTitle" :content="noticeDetail.noticeContent" :time="noticeDetail.time"/>
    <view class="footer"></view>
  </view>
</template>
<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { commonRequest } from "@/utils/request"
import { ref } from "vue";
import CustomCommonDetail from "@/components/custom-common-detail.vue"

const noticeDetail = ref<any>({})

onLoad(async (options:any) => {
  let { id } = options
  let notice = await commonRequest('GET',`app/notice/get/${id}`) as any
  notice.time = notice.createTime.split(" ")[0]
  noticeDetail.value = notice
})
</script>
<style scoped lang="scss">
@import "/src/static/css/base";
</style>