<template>
    <view class="tqb-tabbar">
        <view class="tqb-tabbar-body">
            <view class="tqb-tabbar-item" v-for="(item, index) in tabBarList" :key="index"
                  @click="switchClick(item, index)">
                <view class="tabbar-item-body">
                    <view class="tabbar-item-icon">
                        <image :src="activeIndex == index ? item.selectedIconPath : item.iconPath"
                               style="width: 56rpx; height: 56rpx;"></image>
                    </view>
                    <view :class="[activeIndex == index ? 'active' : '', 'tab-bar-text']">{{ item.text }}</view>
                </view>
            </view>
        </view>
    </view>
</template>
<script setup lang="ts">
import { ref } from "vue";
import bus from '@/utils/bus'
const props = defineProps(['activeIndex'])

interface tarBarList {
    text:string,
    iconPath:string,
    selectedIconPath?:string,
    pagePath?:string
}

const tabBarList = ref<Array<tarBarList>>([
  {
    text: '首页',
    iconPath: '../static/images/customTabBar/home_off.png',
    selectedIconPath: '../static/images/customTabBar/home_on.png',
    pagePath: '/pages/index/index',
  },
  {
    text: '福利',
    iconPath: '../static/images/customTabBar/customer_off.png',
    selectedIconPath: '../static/images/customTabBar/customer_on.png',
    pagePath: '/pages/welfare/index',
  },
  {
    text: '活动',
    iconPath: '../static/images/customTabBar/find_off.png',
    selectedIconPath: '../static/images/customTabBar/find_on.png',
    pagePath: '/pages/activity/index',
  },{
    text: '我的',
    iconPath: '../static/images/customTabBar/work_off.png',
    selectedIconPath: '../static/images/customTabBar/work_on.png',
    pagePath: '/pages/mine/index',
}])

const switchClick = (data: any,index:Number)=> {
    if (index == props.activeIndex) {
        return
    }
    let text = data.text
    let params = {
        text: data.text,
        index
    }

    console.log(data.text)
    bus.emit('activeIndex',params)
}

</script>
<style scoped lang="scss">
@import "../static/css/base";
.tqb-tabbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 98;
}

.tqb-tabbar-body {
    border-radius: batchXpTarlationRPX(72);
    height: batchXpTarlationRPX(62);
    display: flex;
    background: linear-gradient(to right, #ffffff, #F1EDFF);
    position: fixed;
    bottom: batchXpTarlationRPX(34);
    width: batchXpTarlationRPX(360);
    left: batchXpTarlationRPX(15);
    z-index: 1001;
    padding-top: batchXpTarlationRPX(10);
    box-shadow: batchXpTarlationRPX(0,0,9,4) rgba(0, 0, 0, 0.1);

    .tqb-tabbar-item {
        flex: 1;
        display: flex;
        justify-content: center;
        text-align: center;

        .tabbar-item-body {}

        .tabbar-item-icon {
            display: flex;
            justify-content: center;
        }

        .tab-bar-text {
            color: #999999;
            font-size: batchXpTarlationRPX(12);
            margin-top: batchXpTarlationRPX(4);
        }

        .active {
            color: #645AEE;
        }
    }
}
</style>