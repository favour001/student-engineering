<template>
  <view class="member-style-detail">
      <view class="common-box">
        <view class="person-content">
            <view class="person-image" :style="{'background-image':`url(${user.avatar})`}"></view>
            <view class="person-info">
                <view class="person-name">{{user.nickName}}</view>
                <view class="person-position">
                    <uni-tag class="post-name" :text="postItem.postName" size="normal" v-for="postItem in user.postList"></uni-tag>
                </view>
                <view class="person-country">
                    <uni-tag class="study-area" :text="user.studyArea" size="mini"></uni-tag>
                </view>
            </view>
        </view>
        <view class="divider"></view>
        <view class="other">
            <view class="other-item" v-for="otherItem in otherInfo" v-show="otherItem.content">
                <view class="other-title">{{otherItem.title}}</view>
                <view class="other-content">
                    <mp-html :content="otherItem.content"/>
                </view>
            </view>
        </view>
      </view>
      <view class="footer"></view>
  </view>
</template>
<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { commonRequest }  from "@/utils/request"
import {reactive, ref} from "vue";
import UniTag from "@/components/uni-tag.vue"
import mpHtml from "@/components/mp-html/mp-html.vue"
const user = ref<any>({})

const otherInfo = reactive([
    {
        title:'公司名称',
        name:'companyRemark',
        content:''
    },
    {
        title:'职务',
        name:'jobRemark',
        content:''
    },
    {
        title:'社会职务',
        name:'societyJobRemark',
        content:''
    },
    {
        title:'荣誉',
        name:'honorRemark',
        content:''
    },
])

onLoad(async (options:any) => {
    uni.showLoading({
        title:'加载中',
        mask:true
    })
    let { id } = options
    let userInfo = await commonRequest('GET',`app/user/get/${id}`) as any

    otherInfo.forEach(item => {
        for (const itemKey in userInfo) {
            if (item.name == itemKey){
                item.content = userInfo[itemKey]
            }
        }
    })
    user.value = userInfo;
    uni.setNavigationBarTitle({
        title: `${userInfo.nickName}的个人简介`
    });
    uni.hideLoading();
})
</script>
<style lang="scss">
@import "/src/static/css/base";
.other{
  margin-top: batchXpTarlationRPX(30);
}
.other-item{
  margin-bottom:batchXpTarlationRPX(20);
}
.other-title{
  background-color: $theme-color;
  font-size: batchXpTarlationRPX(12);
  border-radius: batchXpTarlationRPX(5);
  height: batchXpTarlationRPX(20);
  line-height: batchXpTarlationRPX(20);
  color: #fff;
  text-align: center;
  margin-bottom: batchXpTarlationRPX(5);
}
.person-content{
  display: flex;
  align-items: flex-end;
  margin-bottom: batchXpTarlationRPX(30);
}
.person-image{
  width: batchXpTarlationRPX(110);
  height: batchXpTarlationRPX(135);
  background-size: cover;
  background-position: center;
  border-radius: batchXpTarlationRPX(10);
}
.person-info{
  padding-left: batchXpTarlationRPX(30);
}
.person-name{
  font-size: batchXpTarlationRPX(24);
  margin-bottom: batchXpTarlationRPX(15);
}
.person-position{
  margin-bottom: batchXpTarlationRPX(6);
  .post-name .uni-tag{
    display: inline-block;
    background-color: $theme-color;
    border-color: $theme-color;
  }
}
.person-country .study-area .uni-tag{
  display: inline-block;
  background-color: $green;
  border-color: $green;
}
</style>