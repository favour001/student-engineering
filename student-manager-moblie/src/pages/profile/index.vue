<template>
  <view class="profile">
    <view class="curtain"></view>
    <view class="common-box">
      <view class="common-title">个人档案</view>
      <view class="profile-content">
        <image class="profile-image" :src="user.archives"></image>
      </view>
    </view>
    <view class="footer"></view>
  </view>
</template>
<script setup lang="ts">
import logo from "@/static/images/associationIntro/logo.png"
import {onLoad} from "@dcloudio/uni-app";
import {commonRequest} from "@/utils/request";
import {ref} from "vue";

let { token:accessToken, userId } = getApp().globalData as any
const user = ref()
onLoad(async (options:any) => {
  user.value = await commonRequest('GET',`app/wxuser/get/${userId}`,{token:accessToken}) as any;
})
</script>
<style lang="scss">
@import "/src/static/css/base";
.profile .common-title{
  font-size: batchXpTarlationRPX(18);
  text-align: justify;
  font-weight: bold;
}

.profile-content{
  padding-top: batchXpTarlationRPX(20);
}
</style>