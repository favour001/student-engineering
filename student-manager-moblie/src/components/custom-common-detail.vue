<template>
    <view class="common-detail">
        <view class="common-box common-content">
            <view class="common-title">{{title}}</view>
            <view class="common-info">
                <view class="tag-item">时间：<text class="theme-font-color">{{time}}</text></view>
                <view class="tag-item" v-if="type == 'tweet'">类别：<text class="theme-font-color">{{typeName}}</text></view>
            </view>
            <view class="common-rich-content">
                <mp-html :content="content"/>
            </view>
        </view>
    </view>
</template>
<script setup lang="ts">
import mpHtml from "@/components/mp-html/mp-html.vue"
const props = defineProps(['title','content','time','type','typeName'])

</script>

<style scoped lang="scss">
@import "../static/css/base";
.common-title{
  font-size: batchXpTarlationRPX(18);
  text-align: justify;
  font-weight: bold;
}
.common-info{
  font-size: batchXpTarlationRPX(12);
  color: #6c6c6c;
  display: flex;
  align-items: center;
  padding: batchXpTarlationRPX(0,10);
  height: batchXpTarlationRPX(30);
  border-radius: batchXpTarlationRPX(10);
  background-color: #EFEFEF;
  margin-top: batchXpTarlationRPX(10);
}
.common-rich-content{
  margin-top: batchXpTarlationRPX(20);
}
.tag-item{
    margin-right: batchXpTarlationRPX(10);
}
</style>