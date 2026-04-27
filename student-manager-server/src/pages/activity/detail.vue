<template>
  <view class="activity-detail">
    <view class="curtain"></view>
    <view class="activity-content">
      <view class="activity-item">
        <view class="activity-image" :style="{'background-image':'url('+ activityDetail.avaterUrl +')'}">
          <view class="activity-time" v-if="activityDetail.status == '5'">
            {{activityDetail.endTime.split(' ')[0].substr(5)}}
          </view>
          <view class="activity-time" v-if="activityDetail.status != '5'">
            {{activityDetail.startTime.split(' ')[0].substr(5)}}
          </view>
        </view>
        <view class="activity-container">
          <view class="activity-info">
            <view class="activity-base">
              <view class="activity-title margin-bottom-10">
                <image class="icon" src="../../static/images/activity/activity-icon.png"></image>
                <text class="text">{{activityDetail.title}}</text>
              </view>
              <view class="activity-date activity-font margin-bottom-5">
                <text>时间：</text>
                <text>{{activityDetail.startTime.split(' ')[0]}} ~ {{activityDetail.endTime.split(' ')[0]}}</text>
              </view>
              <view class="activity-local activity-font margin-bottom-5">
                <text>地点：</text>
                <image class="local" v-if="activityDetail.address" src="../../static/images/activity/location.png"></image>
                <text>{{activityDetail.address ? activityDetail.address : '暂定'}}</text>
              </view>
              <view class="activity-contacts activity-font margin-bottom-5">
                <text>联系人：</text>
                <text>{{activityDetail.contactName ? activityDetail.contactName : '暂定'}}</text>
              </view>
              <view class="activity-quota activity-font margin-bottom-5">
                <text>活动名额：</text>
                <text>{{activityDetail.signQuota}}</text>
              </view>
              <view class="activity-participants activity-font margin-bottom-5">
                <text>参加人员：</text>
                <text>{{activityDetail.signType == '1' ? '协会会员' : '所有人'}}</text>
              </view>
            </view>
            <view class="activity-btn">
              <button class="btn" v-if="activityDetail.statusName != '报名中'" @click="cancelSign(activityDetail.id)">取消报名</button>
              <button class="btn" v-if="activityDetail.statusName == '报名中'" @click="sign(activityDetail.id)">报名</button>
            </view>
          </view>
        </view>
        <view class="activity-sign">
          <view class="activity-sign-text">
            已报名
            <view>({{activityDetail.successNumber}}/{{activityDetail.signQuota}})</view>
          </view>
          <view class="activity-sign-users">
            <view class="users-list">
              <view class="user-item" v-for="item in activityDetail.signListVOS">
                <view class="user-image" :style="{'background-image':'url('+ item.avaterUrl +')'}" v-if="item.avaterUrl"></view>
                <view class="user-image" :style="{'background-image':'url(../../static/images/mine/avatar.png)'}" v-if="!item.avaterUrl"></view>
                <view class="user-name">{{item.userName || item.nickName}}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="activity-introduce">
      <view class="activity-suspension">活动详情</view>
      <view class="activity-content-title">
        {{activityDetail.title}}
      </view>
      <view class="activity-introduce-content">
        <mp-html :content="activityDetail.remark"/>
      </view>
    </view>
    <view class="footer"></view>
  </view>
</template>
<script setup lang="ts">
import {onLoad} from "@dcloudio/uni-app";
import {commonRequest} from "@/utils/request";
import mpHtml from "@/components/mp-html/mp-html.vue"
import {ref} from "vue";

const activityDetail = ref()

let { token:accessToken, userId } = getApp().globalData as any

const sign = async (id:Number) => {
  let res = await commonRequest('GET',`app/sign/add/${userId}/${id}`,{token:accessToken}) as any;
  if (res){
    uni.showToast({
      title: '恭喜您，报名成功',
      //将值设置为 success 或者直接不用写icon这个参数
      icon: 'success',
      //显示持续时间为 2秒
      duration: 2000
    })
  }
}
const cancelSign = async (id:Number) => {
  let res = await commonRequest('DELETE',`app/sign/delete/${userId}/${id}`,{token:accessToken}) as any;
  if (res){
    uni.showToast({
      title: '取消报名成功',
      //将值设置为 success 或者直接不用写icon这个参数
      icon: 'success',
      //显示持续时间为 2秒
      duration: 2000
    })
  }
}

onLoad(async (options:any) => {
  let { id } = options

  activityDetail.value = await commonRequest('GET',`app/activity/get/${id}/${userId}`) as any;

})
</script>
<style lang="scss">
@import "/src/static/css/base";
@import "activity";
</style>