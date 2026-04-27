<template>
  <view class="graphics" @click="graphicsClick(graphicsContextItem.id,type)">
      <view class="image" :style="{'background-image':'url('+image+')'}">
<!--          <image :src="graphicsContextItem.noticeUrl"></image>-->
      </view>
      <view class="info">
          <view class="title">{{title}}</view>
          <view class="foot-info">
              <text>时间：{{ graphicsContextItem.createTime.split(" ")[0] }}</text>
          </view>
      </view>
  </view>
</template>

<script setup>
import {onMounted} from "vue";
import bus from '@/utils/bus'
const props = defineProps(['graphicsContextItem','type','name','clickName','title','image'])

const graphicsClick = (id, type) => {
    bus.emit(props.clickName,{id, type});
}
onMounted(() => {

})
</script>


<style scoped lang="scss">
@import "../static/css/base";
  .graphics{
    display: flex;
    padding: batchXpTarlationRPX(10,0);
    border-top: 1px dashed $theme-background;
  }
  .image{
    width: batchXpTarlationRPX(135);
    flex: 0 0 batchXpTarlationRPX(135);
    height: batchXpTarlationRPX(100);
    margin-right: batchXpTarlationRPX(15);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
  }
  .title{
    font-size: batchXpTarlationRPX(14);
  }
  .foot-info{
    font-size: batchXpTarlationRPX(12);
    color: #CECECE;
  }
  .info{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>