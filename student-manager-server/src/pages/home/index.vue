<template>
    <view class="content">
        <uni-swiper-dot class="uni-swiper-dot-box" :info="banner.list" :current="banner.current" :mode="banner.mode"
                        :dots-styles="banner.dotsStyles" field="title">
            <swiper class="swiper-box" @change="bannerChange" :current="banner.swiperDotIndex">
                <swiper-item class="swiper-item" v-for="({avaterUrl,id}, index) in banner.list" :key="index">
                    <view class="swiper-item-image" v-bind:style="{backgroundImage: 'url('+avaterUrl+')'}" v-on:click="hrefPage(id)">
                    </view>
                </swiper-item>
            </swiper>
        </uni-swiper-dot>
        <view class="notice">
            <uni-notice-bar show-icon scrollable
                            :text="notice.noticeTitle"
                            showGetMore
                            @getmore="getMore" ></uni-notice-bar>
        </view>
        <view class="meun-container">
            <uni-grid class="grid" :column="5" :highlight="false" :showBorder="false" :paddingLeft="'0 19.2rpx'" :square="false" @change="change">
                <uni-grid-item class="grid-item" v-for="(item, index) in meunList" :index="index" :key="index">
                    <view class="grid-item-box">
                        <image class="meun-image" :src="item.img"></image>
                        <text class="text">{{ item.text }}</text>
                    </view>
                </uni-grid-item>
            </uni-grid>
        </view>
        <view class="tab-container common-box-2">
            <uni-segmented-control class="tab" :current="tab.current" :values="tab.items" :style-type="tab.styleType"
                                   :active-color="tab.activeColor" @clickItem="onClickItem" />
            <view class="tab-content">
                <custom-graphics-context class="graphics-item" v-for="item in tab.articleList" :title="item.title" :image="item.articleUrl" clickName="articleItem" :graphicsContextItem="item" :type="item.type"/>
            </view>
            <uni-load-more :status="tab.loadStatus"></uni-load-more>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
//轮播图组件
import UniSwiperDot from '@/components/uni-swiper-dot.vue'
//金刚区组件
import UniGrid from '@/components/uni-grid.vue'
import UniGridItem from '@/components/uni-grid-item.vue'
//分段器组件
import UniSegmentedControl from "@/components/uni-segmented-control.vue";
//金刚区图片
import societyIntroduce from '@/static/images/jingangDistrict/societyintroduce.png'
import memberStyle from '@/static/images/jingangDistrict/memberstyle.png'
import video from '@/static/images/jingangDistrict/video.png'
import memberShipNotice from '@/static/images/jingangDistrict/membershipnotice.png'
import memberShipApplication from '@/static/images/jingangDistrict/membershipapplication.png'
//通告栏
import UniNoticeBar from "@/components/uni-notice-bar.vue"
//图文组件
import CustomGraphicsContext from '@/components/custom-graphics-context.vue'

//加载更多
import UniLoadMore from '@/components/uni-load-more/uni-load-more.vue'
import { commonRequest } from '@/utils/request'
//bug
import bus from '@/utils/bus'

interface info {
    colorClass:string,
    url:string,
    content:string
}


let banner = reactive({
    list:[],
    current:0,
    mode:"round",
    swiperDotIndex:0,
    dotsStyles:{
        backgroundColor: 'rgba(237, 125, 29, .3)',
        border: '1px rgba(237, 125, 29, .3) solid',
        color: '#fff',
        selectedBackgroundColor: 'rgba(237, 125, 29, .9)',
        selectedBorder: '1px rgba(237, 125, 29, .9) solid'
    }
})

//金刚区
const meunList = ref([
    {
        img: societyIntroduce,
        text: '协会介绍',
        path: '/pages/introduce/index'
    },
    {
        img: memberStyle,
        text: '成员风采',
        path: '/pages/memberStyle/index'
    },
    {
        img: video,
        text: '视频',
        path: '/pages/video/index'
    },
    {
        img: memberShipNotice,
        text: '留创顺德',
        path: '/pages/stayInShunDe/index'
    },
    {
        img:memberShipApplication,
        text:'入会申请',
        path:'/pages/application/index'
    }
])

//分段器
const tab = reactive({
    items: ['总会动态', '海外分会动态'],
    styleType: "text",
    activeColor:"#ED7D1D",
    current:0,
    articleList:[],
    total:0,
    loadStatus:'more'
})

//区域滚动
const scroll = reactive({
    scrollTop:0,
    old:{
        scrollTop:0
    }
})

//分页参数
const articleQueryParams = reactive({
    pageNum: 1,
    pageSize: 5,
    orderByColumn: 'id',
    isAsc: 'desc'
})

const notice = ref()

const onClickItem = (e:any) => {
    if (tab.current !== e.currentIndex) {
        tab.current = e.currentIndex
        articleQueryParams.pageNum = 1
        tab.loadStatus = 'more'
        getArticleList()
    }
}

const getArticleList = async () => {
    let { list, total }= await commonRequest('GET','app/article/list',{},{...articleQueryParams,type:tab.current ? 2 : 1}) as any;

    tab.total = total
    tab.articleList = list
}

const getNoticeList = async () => {
  const noticeList = await commonRequest('GET','app/notice/list',{}) as any;
  notice.value = noticeList[0]
}

const bannerChange = (e:any) => {
    banner.current = e.detail.current
}

//跳转到微信公众号文章
const hrefPage = (id:string) => {
    uni.navigateTo({
        url:`/pages/oAArticle/index?id=${id}`
    })
}

//跳转到文章详情
bus.on("articleItem",({id, type}) => {
    uni.navigateTo({
        url:`/pages/article/index?id=${id}&type=${type}`
    })
})

//跳转到文章详情
bus.on("loadData",async (val) => {
    if (val){
        if (tab.articleList.length == tab.total){
            tab.loadStatus = 'noMore'
            return
        }
        if (tab.loadStatus == 'more'){
            tab.loadStatus = 'loading'
            articleQueryParams.pageNum++
            let { list } = await commonRequest('GET','app/article/list',{},{...articleQueryParams,type:tab.current ? 2 : 1}) as any
            tab.loadStatus = 'more'
            tab.articleList = tab.articleList.concat(list);
        }
    }
})

//通告栏查看更多
const getMore = () => {
  uni.navigateTo({
    url:`/pages/notice/index`
  })
}

const change = (e:any) => {
    let {
        index
    } = e.detail
    uni.navigateTo({
        url:`${meunList.value[index].path}`
    })
    uni.setNavigationBarTitle({
        title:`${meunList.value[index].text}`
    });
}

onMounted(async () => {

    banner.list = await commonRequest('GET','app/banner/list') as any
    getArticleList()
    getNoticeList()
})

</script>

<style lang="scss">
    @import "/src/static/css/base";
    @import "home";

</style>