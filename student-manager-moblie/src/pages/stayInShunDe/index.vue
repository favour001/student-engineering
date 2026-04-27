<template>
  <view class="stay-in-shunde">
      <view class="navigate">
          <scroll-view scroll-x class="scroll-wrapper" scroll-with-animation="true" :scroll-into-view="'item'+(tab.current < 3 ? 0 : tab.current - 2)" >
              <view class="navigate-item tabs-items"
                    :class="{'active': tab.current == index}"
                    :id="'item'+index"
                    v-for="(item,index) in tab.items"
                    :key="index"
              @click="handleClick(item,index)">{{item.name}}</view>
          </scroll-view>
      </view>
      <view class="navigate-content">
          <view class="common-box-2">
              <custom-graphics-context class="graphics-item" v-for="item in tab.tweetList" :title="item.tweetTitle" :image="item.tweetImg" clickName="tweetItem" :graphicsContextItem="item" :type="item.type" name="tweet"/>
          </view>
      </view>
  </view>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { commonRequest } from "@/utils/request"
//图文组件
import CustomGraphicsContext from '@/components/custom-graphics-context.vue'
import bus from '@/utils/bus'
import {onLoad} from "@dcloudio/uni-app";
interface tabItems{
    name:string,
    id:string
}
//分段器
const tab = reactive({
    items: [
        {
            id: '1',
            name: '人才政策'
        },
        {
            id: '2',
            name: '留创园信息'
        },
        {
            id: '3',
            name: '创新创业扶持政策'
        },
        {
            id: '4',
            name: '人才招聘'
        },
        {
            id: '5',
            name: '项目合作'
        }
    ],
    styleType: "text",
    activeColor:"#ED7D1D",
    current:0,
    tweetList:[],
    total:0,
    loadStatus:'more'
})

const handleClick = (tabItem:tabItems,index:number) => {
    tab.current = index
    getTweetList(tabItem.id)
}

const getTweetList = async (tweetType:string) => {
    uni.showLoading({
        title:'加载中',
        mask:true
    })
    tab.tweetList = await commonRequest('GET','app/tweet/list',{},{tweetType}) as any
    uni.hideLoading()
}

//跳转到文章详情
bus.on("tweetItem",({id, type}) => {
    uni.navigateTo({
        url:`/pages/stayInShunDe/detail?id=${id}`
    })
})
onLoad(async () => {
    getTweetList('1')
})

</script>
<style lang="scss">
@import "/src/static/css/base";
.scroll-wrapper {
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  background: #FFF;
  box-sizing: border-box;
  padding: batchXpTarlationRPX(0,10);
}
::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
}
.navigate{
  display: flex;
  height: 100%;
  overflow-x: auto;
  white-space: nowrap;
  min-width: 100%;
}
.tabs-items{
  display: inline-block;
  margin: batchXpTarlationRPX(0,10);
  font-size: batchXpTarlationRPX(14);
  padding-top: batchXpTarlationRPX(12);
  padding-bottom: batchXpTarlationRPX(11);
  border-bottom: batchXpTarlationRPX(2) solid transparent;
  &.active{
    color: $theme-color;
    border-bottom:  batchXpTarlationRPX(2) solid $theme-color;
  }
}
</style>