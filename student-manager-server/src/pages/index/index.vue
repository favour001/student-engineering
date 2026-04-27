<template>
    <scroll-view class="scroll-view" scroll-y="true" @scrolltolower="scrollRecord">
      <view class="association">
        <view class="curtain"></view>
        <home v-if="currentIndex === 0"></home>
        <welfare v-if="currentIndex === 1"></welfare>
        <activity v-if="currentIndex === 2"></activity>
        <mine v-if="currentIndex === 3"></mine>
        <view class="safe-distance-bottom"></view>
        <custom-tar-bar :activeIndex="currentIndex"></custom-tar-bar>
      </view>
    </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import mine from '@/pages/mine'
import activity from '@/pages/activity'
import home from '@/pages/home'
import welfare from '@/pages/welfare'
import CustomTarBar from '@/components/custom-tabbar.vue'
import bus from '@/utils/bus'
const currentIndex = ref(0)

bus.on('activeIndex',(value:any) => {
    currentIndex.value = value.index
    uni.setNavigationBarTitle({
        title: value.text
    });
})

//上拉加载
const scrollRecord = (e:any) => {
    if (currentIndex.value !== 0){
        return
    }
    bus.emit('loadData',true)
}


</script>

<style lang="scss">
@import "/src/static/css/base";

</style>