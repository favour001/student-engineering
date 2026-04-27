<template>
    <view class="introduce">
        <view class="curtain"></view>
        <view class="introduce-content">
            <image :src="logo_1" class="logo_1"/>
            <view class="common-box introduce-rich-content">
                <view>
                    <image :src="logo_2" class="logo_2"/>
                </view>
                <view>
                    <mp-html :content="intro.remark as string" lazy-load/>
                </view>
            </view>
        </view>
        <view class="footer"></view>
    </view>
</template>
<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { commonRequest }  from "@/utils/request";
import logo_1 from "@/static/images/associationIntro/logo_1.png"
import logo_2 from "@/static/images/associationIntro/logo_2.png"
import mpHtml from "@/components/mp-html/mp-html.vue"
import {ref} from "vue";

const intro = ref<any>({})

onLoad(async (options:any) => {
    uni.setNavigationBarTitle({
        title: '顺德留学生协会介绍'
    });
    intro.value = await commonRequest('GET',`app/xiehui/get/1`)
})
</script>

<style lang="scss">
@import "/src/static/css/base";
.introduce-content{

}
.logo_1{
    width: batchXpTarlationRPX(238);
    height: batchXpTarlationRPX(35);
    display: flex;
    margin: batchXpTarlationRPX(22) auto batchXpTarlationRPX(22);
}
.logo_2{
    width: batchXpTarlationRPX(110);
    height: batchXpTarlationRPX(80);
    display: flex;
    margin: 0 auto batchXpTarlationRPX(22);
}
.introduce-rich-content{

}
</style>