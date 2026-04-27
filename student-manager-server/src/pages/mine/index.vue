<template>
    <view class="content">
        <view class="mine-bg" :style="{'background-image':'url('+ mineBg +')'}">
            <view class="mine">
                <view class="mine-avatar">
                  <view class="avatar" :style="{'background-image':'url('+ defaultAvatar +')'}" v-if="!user?.avaterUrl"></view>
                  <view class="avatar" :style="{'background-image':'url('+ user?.avaterUrl +')'}" v-if="user?.avaterUrl"></view>
<!--                    <image class="avatar" :src="defaultAvatar" v-if="!user?.avaterUrl"/>-->
<!--                    <image class="avatar" :src="user?.avaterUrl" v-if="user?.avaterUrl"/>-->
                </view>
                <view class="login">
                    <view class="login-name"><text class="user-name">{{user?.userName ? user?.userName : "微信用户"}}</text><text>{{user?.userEnglishName ? user?.userEnglishName : ""}}</text></view>
                    <uni-tag :text="user?.$gender as any"></uni-tag>
                    <button open-type="getPhoneNumber" @getphonenumber="getCode" class="login-btn" v-if="!isLogin">登录</button>
                    <!-- <button @click="openPopup" class="login-btn" v-if="!isLogin">登录</button> -->
                </view>
            </view>
        </view>
        <view>
          <!-- 普通弹窗 -->
          <uni-popup ref="popup" :is-mask-click="false" background-color="#fff">
            <view class="popup-content">
              <view class="header">
                <text></text>
              </view>
              <view class="body">
                <view class="text-1">
                  <view class="title">
                    欢迎您使用顺德留学生协会小程序，您可使用本应用的相关服务功能，在使用本小程序的过程中，我们将联网并向您申请以下权限：
                  </view>
                </view>
                <view class="text-2">
                  <view>
                      获取微信账号信息：用于小程序的登录功能
                  </view>
                </view>
                <view class="text-3">
                  *请你阅读并同意我们的<text class="blue">《用户协议》</text>与<text class="blue">《隐私政策》</text>，了解您的用户权益及相关的使用数据的处理方法
                </view>
              </view>
              <view class="footer">
                <view class="btn"><button plain="true">取消</button></view>
                <view class="btn"><button plain="true">确认</button></view>
              </view>
            </view>
          </uni-popup>
        </view>
        <view class="list-content">
            <uni-list>
<!--              <uni-list-item v-for="item in meunList" showArrow :thumb="item.icon" link="navigateTo" thumbSize="sm" @click="meunClick(item)" :title="item.name"/>-->
                <uni-list-item v-for="item in meunList" showArrow :thumb="item.icon" >
                    <!-- 自定义 header -->
<!--                    <template v-slot:header>-->
<!--                      <view class="slot-box"><image class="slot-image" :src="item.icon"></image></view>-->
<!--                    </template>-->
                    <!-- 自定义 body -->
                    <template class="item-body" v-slot:body>
                      <button class="slot-btn" v-if="item.type == 'noNeedBtn'" @click="meunClick(item)">
                        {{ item.name }}
                      </button>
                      <button class="slot-btn" v-if="item.type == 'needBtn'" open-type="contact">
                        {{ item.name }}
                      </button>
                    </template>
                </uni-list-item>
            </uni-list>
        </view>
    </view>
</template>

<script setup lang="ts">
import mineBg from "@/static/images/mine/mybg.png"
import { commonRequest } from "@/utils/request";
import defaultAvatar from "@/static/images/mine/avatar.png"
import {onMounted, reactive, ref} from "vue";

import idcard from "@/static/images/mine/antOutline-idcard.png"
import gift from "@/static/images/mine/antOutline-gift.png"
import customer from "@/static/images/mine/antOutline-customer.png"
import reconciliation from "@/static/images/mine/antOutline-reconciliation.png"

//列表
import UniList from "@/components/uni-list/uni-list.vue"
import UniListItem from "@/components/uni-list-item/uni-list-item.vue"

import UniTag from "@/components/uni-tag.vue";

import UniPopup from "@/components/uni-popup/uni-popup.vue";

const isLogin = ref<boolean>(false);

interface User {
    id?:number,
    userName?:string,
    userEnglishName?:string,
    avaterUrl?:string,
    $gender?:string
}

const user = ref<User>({
  id:0
})

const popup = ref(null)

const meunList = reactive([
    {
        "name":'修改登记资料',
        "type":'noNeedBtn',
        "icon":idcard,
        "path":'/pages/mineinfo/index'
    },
    {
        "name":'我的卡包',
        "type":'noNeedBtn',
        "icon":gift,
        "path":'/pages/cardpackage/index'
    },
    {
        "name":'联系客服',
        "type":'needBtn',
        "icon":customer,
        "path":'/pages/customerservice/index'
    },
    {
        "name":'个人档案',
        "type":'noNeedBtn',
        "icon":reconciliation,
        "path":"/pages/profile/index"
    }
])

let { token:accessToken, userId, toLogin, card } = getApp().globalData as any

const getCode = async (e:any) => {
    uni.showLoading({
        title:'登录中',
        mask:true
    })
    let { code:phoneCode,errMsg:phoneMsg } = e.detail
    let { code:loginCode,errMsg:loginMsg } = await uni.login()
    if (phoneMsg == "getPhoneNumber:ok" && loginMsg == "login:ok"){
        let { token,id } = await commonRequest('GET',`app/wxlogin/login`,{},{
            phoneCode,
            loginCode
        }) as any

        isLogin.value = !!token

        uni.setStorageSync("token",token);
        uni.setStorageSync("userId",id);
        getApp().globalData.token = token
        getApp().globalData.userId = id
        accessToken = token;
        user.value = await getUserInfo(id) as any;
        if (toLogin){
          uni.showModal({
            title: '温馨提示',
            content: '登录成功',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                let jumpUrl = `/pages/welfare/detail?cardId=${getApp().globalData.card.cardId}&type=${getApp().globalData.card.type}`
                getApp().globalData.toLogin = false
                getApp().globalData.card = {}
                uni.navigateTo({
                  url: jumpUrl
                })
              }
            }
          })
        }
    }
    uni.hideLoading();
}

const getUserInfo = async (id:number) => {
   return await commonRequest('GET', `app/wxuser/get/${id}`,{token:accessToken}) as any
}

const meunClick = (item:any) => {
  if (!uni.getStorageSync("token")){
    uni.showModal({
      title: '温馨提示',
      content: '登录后享受更多功能',
      showCancel: false
    })
  }else {
    uni.navigateTo({
      url:`${item.path}?userId=${user.value.id}`
    })
  }

}

const onClick = () => {
  console.log(12121212)
  // uni.navigateTo({
  //   url:`${item.path}`
  // })
}

const openPopup = () => {
  console.log(popup.value)
  popup.value.open('bottom')
}

onMounted(async (options:any) => {
  // popup.value.open('bottom')
  
    if (accessToken) {
        try {
            user.value = await getUserInfo(userId) as any;
            isLogin.value = !!accessToken;
        }catch (e) {
            uni.setStorageSync("token",'');
            uni.setStorageSync("userId",'');
            isLogin.value = false
        }
    }


})
</script>

<style lang="scss">
@import "/src/static/css/base";
@import "mine";
</style>