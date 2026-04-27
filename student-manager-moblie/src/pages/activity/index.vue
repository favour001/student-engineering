<template>
    <view class="activity">
      <view class="activity-content">
        <view class="activity-item" v-for="(item,index) in activityList" :key="index">
          <view class="activity-image" :style="{'background-image':'url('+ item.avaterUrl +')'}">
            <view class="activity-time" v-if="item.status == '5'">
              {{item.endTime.split(' ')[0].substr(5)}}
            </view>
            <view class="activity-time" v-if="item.status != '5'">
              {{item.startTime.split(' ')[0].substr(5)}}
            </view>
          </view>
          <view class="activity-container">
            <view class="activity-info">
              <view class="activity-base">
                <view class="activity-title margin-bottom-10">
                  <image class="icon" src="../../static/images/activity/activity-icon.png"></image>
                  <text class="text">{{item.title}}</text>
                </view>
                <view class="activity-date activity-font margin-bottom-5">
                  <text>时间：</text>
                  <text>{{item.startTime.split(' ')[0]}} ~ {{item.endTime.split(' ')[0]}}</text>
                </view>
                <view class="activity-local activity-font margin-bottom-5">
                  <text>地点：</text>
                  <image class="local" v-if="item.address" src="../../static/images/activity/location.png"></image>
                  <text>{{item.address ? item.address : '暂定'}}</text>
                </view>
                <view class="activity-contacts activity-font margin-bottom-5">
                  <text>联系人：</text>
                  <text>{{item.contactName ? item.contactName : '暂定'}}</text>
                </view>
              </view>
              <view class="activity-btn">
                <button class="btn" v-if="item.status != '5'" @click="hrefPage(item.id)">活动详情</button>
                <button class="btn activity-finish" v-if="item.status == '5'" @click="hrefPage(item.id)">已结束</button>
              </view>
            </view>
            <view class="activity-sign-list">
              <view class="sign-image-list">
                <image class="sign-image-item" :src="signItem.avaterUrl ? signItem.avaterUrl : '../../static/images/mine/avatar.png'" v-for="(signItem,signIndex) in item.signListVOS" :key="signIndex"></image>
              </view>
              <view class="sign-text">{{item.titleName}}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import { commonRequest }  from "@/utils/request"

const activityList = ref();
//跳转到活动详情
const hrefPage = (id:string) => {
  uni.navigateTo({
    url:`/pages/activity/detail?id=${id}`
  })
}

onMounted(async () => {

  activityList.value = await commonRequest('GET',`app/activity/list`) as any;
  console.log(activityList.value)
})
</script>

<style lang="scss">
@import "/src/static/css/base";
@import "activity";
</style>