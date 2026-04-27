<template>
    <view class="article">
      <view v-if="!articleDetail?.contentType || articleDetail.contentType == '1'">
        <view class="curtain"></view>
        <custom-common-detail :title="articleDetail.title" :content="articleDetail.remark" :time="articleDetail.time"/>
        <view class="footer"></view>
      </view>
      <view v-if="articleDetail.contentType == '2'">
        <web-view :src="articleDetail.remark"></web-view>
      </view>
    </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { commonRequest }  from "@/utils/request"
import {ref} from "vue";
import CustomCommonDetail from "@/components/custom-common-detail.vue"

const articleDetail = ref<any>({})


onLoad(async (options:any) => {
    let { id, type } = options
    uni.setNavigationBarTitle({
        title: type == '1' ? '总会动态' : '海外分会动态'
    });
    let article = await commonRequest('GET',`app/article/get/${id}`) as any;
    article.time = article.createTime.split(" ")[0]
    articleDetail.value = article

    console.log(options)
})
</script>

<style lang="scss">
@import "/src/static/css/base";
</style>