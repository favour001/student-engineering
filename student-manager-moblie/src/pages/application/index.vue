<template>
  <view class="application">
      <view class="common-box">
          <view class="application-header">
              <view class="application-title">{{application.title}}</view>
              <view class="application-logo">
                  <image :src="logo"/>
              </view>
          </view>
          <view class="application-time">{{application.createTime}}</view>
          <view class="application-content">
              <mp-html :content="application.remark"/>
              <button size="mini" class="application-btn" @click="apply">申请入会</button>
          </view>
      </view>
      <view class="footer"></view>
  </view>
</template>
<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { commonRequest }  from "@/utils/request"
import {ref} from "vue";
import logo from "@/static/images/associationIntro/logo.png"
import mpHtml from "@/components/mp-html/mp-html.vue"

interface application{
    title:string,
    createTime:Date,
    remark:string
}

const application = ref<application>()

const apply = () => {
    uni.navigateToMiniProgram({
        appId: 'wxd947200f82267e58',
        path: 'pages/wjxqList/wjxqList?activityId=hSAajeX'
    })
}

onLoad(async (options:any) => {
    application.value = await commonRequest('GET',`app/ruhui/get/1`) as any;
})
</script>
<style lang="scss">
@import "/src/static/css/base";
.application-header{
    display: flex;
    justify-content: space-between;
    margin-bottom: batchXpTarlationRPX(15);
}
.application-logo{
    width: batchXpTarlationRPX(50);
    height: batchXpTarlationRPX(50);
    image{
        width: 100%;
        height: 100%;
    }
}
.application-title{
    font-size: batchXpTarlationRPX(18);
    font-weight: 700;
}
.application-time{
    font-size: batchXpTarlationRPX(12);
    color: $gary;
}
.application-btn{
    width: 100%;
    background-color: $theme-color;
    border-color: $theme-color;
    color: #fff;
    margin-top: batchXpTarlationRPX(30);
}
</style>