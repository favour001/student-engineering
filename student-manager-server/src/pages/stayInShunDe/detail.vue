<template>
    <view class="article">
        <view class="curtain"></view>
        <custom-common-detail :title="tweetDetail.tweetTitle" :content="tweetDetail.tweetContent" :typeName="tweetDetail.typeName" :time="tweetDetail.time" type="tweet"/>
        <view class="footer"></view>
    </view>
</template>
<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { commonRequest } from "@/utils/request"
import {reactive, ref} from "vue";
import CustomCommonDetail from "@/components/custom-common-detail.vue"

const tweetDetail = ref<any>({})

const policyList = reactive([
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
])
onLoad(async (options:any) => {
    let { id } = options
    uni.setNavigationBarTitle({
        title: '留创顺德详情'
    });
    let tweet = await commonRequest('GET',`app/tweet/get/${id}`) as any
    tweet.time = tweet.createTime.split(" ")[0]
    tweet.typeName = policyList.filter(fItem => fItem.id == tweet.tweetType)[0].name
    tweetDetail.value = tweet
    // console.log(options)
})
</script>
<style scoped lang="scss">
@import "/src/static/css/base";
</style>