<template>
    <view>
        <web-view :src="pageUrl"></web-view>
    </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { commonRequest } from "@/utils/request"
import {ref} from "vue";
const pageUrl = ref("")
onLoad(async (options:any) => {
    let { id } = options
    let { pointUrl } : any = await commonRequest('GET',`app/banner/info/${id}`)
    pageUrl.value = pointUrl
    console.log(options)
})
</script>

<style scoped>

</style>