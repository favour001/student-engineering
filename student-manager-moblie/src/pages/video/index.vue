<template>
  <view class="video">
      <view class="curtain"></view>
      <view class="video-content">
          <uni-card :cover="item.avaterUrl" v-for="item in videoList" @click="openVideo(item)">
              <!-- <image slot='cover' style="width: 100%;" :src="cover"></image> -->
              <text class="uni-body">{{item.title}}</text>
          </uni-card>
      </view>
      <view class="footer"></view>
  </view>
</template>
<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import UniCard from '@/components/uni-card.vue'
import { commonRequest } from "@/utils/request"
import {ref} from "vue";

interface video{
    avaterUrl:string,
    title:string,
    finderUserName:string,
    feeldId:string
}
const videoList = ref<Array<video>>()

const openVideo = (video:video) => {
    uni.openChannelsActivity({
        finderUserName:video.finderUserName,
        feedId:video.feeldId,
        success:function(res){
            console.log('chenggong ');
            console.log(res)
        },
        fail:function(err){
            console.log('fail')
            console.log(err);
        },
        complete:function(){
            console.log('调用');
        }
    })
}

onLoad(async () => {
    videoList.value = await commonRequest('GET',`app/video/list`) as any;
})
</script>
<style lang="scss">
@import "/src/static/css/base";

</style>