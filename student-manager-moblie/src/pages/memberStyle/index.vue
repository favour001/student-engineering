<template>
    <view class="member-style">
        <view class="curtain"></view>
        <view class="member-style-content">
            <view class="member-style-search">
                <uni-search-bar placeholder="请输入成员名字" @blur="blur" @clear="clear" :focus="true" cancelButton="none"></uni-search-bar>
            </view>
            <view class="member-style-tab">
                <view class="side-tabs">
                    <view class="side-tab-item" :class="{'active':tab.currentIndex == index}" v-for="(item,index) in deptList" :key="index" @click="selectTab(index,item)">
                        {{item.deptName}}
                    </view>
                </view>
                <view class="tab-content">
                    <scroll-view class="tab-scroll-view" scroll-y="true">
                        <view class="tab-content-item" v-for="userItem in userList" @click="detail(userItem.id)">
                            <view class="image" :style="{'background-image':'url('+ userItem.avatar +')'}">
<!--                                <image :src="userItem.avatar"></image>-->
                            </view>
                            <view class="info">
                                <view class="info-content">
                                    <view class="info-top">
                                        <view class="nick-name">{{userItem.nickName}}</view>
                                        <view class="post-list">
                                            <uni-tag class="post-name" :text="postItem.postName" size="normal" v-for="postItem in userItem.postList"></uni-tag>
                                        </view>
                                    </view>
                                    <view class="info-footer">
                                        <view class="study-area">
                                            {{userItem.studyArea}}
                                        </view>
                                        <view class="graduation-school">
                                            {{userItem.graduationSchool}}
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </scroll-view>

                </view>
            </view>

        </view>
    </view>

</template>
<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { commonRequest }  from "@/utils/request"
import {reactive, ref} from "vue";
import { compare } from "@/utils/util"
import UniSearchBar from "@/components/uni-search-bar/uni-search-bar.vue"
import UniTag from "@/components/uni-tag.vue"
interface dept{
    id:number,
    deptName:string
}

interface post{
    postName:string
}

interface user{
    nickName:string,
    avatar:string,
    studyArea:string,
    graduationSchool:string,
    postList:Array<post>
}

const tab = reactive({
    currentIndex:0
})

const postList = ref<Array<post>>([])
const deptList = ref<Array<dept>>([])
const userList = ref<Array<user>>([])
const userParams = reactive({
    pageSize:5,
    userName:'',
    deptId:0
})


const getUserList = async () => {
    uni.showLoading({
        title:'加载中',
        mask:true
    })
    let userlist = await commonRequest('GET',`app/user/list`,{},userParams) as any
    userList.value = userlist.sort(compare('orderNumber', true))
    console.log(userList.value)
    uni.hideLoading();
}

const selectTab = (index:number,dept:dept) => {
    tab.currentIndex = index
    userParams.deptId = dept.id
    getUserList()
}

const blur = (res:any) => {
    if (!res.value) return
    userParams.userName = res.value
    getUserList();
}

const clear = (res:any) => {
    userParams.userName = ''
    getUserList();
}

const detail = (id:number) => {
    uni.navigateTo({
        url:`/pages/memberStyle/detail?id=${id}`
    })
}

onLoad(async () => {
    postList.value = await commonRequest('GET',`app/post/list`) as any
    deptList.value = await commonRequest('GET',`app/dept/list`) as any
    userParams.deptId = deptList.value[0].id
    getUserList();
})
</script>
<style lang="scss">
@import "/src/static/css/base";
.member-style-tab{
    display: flex;
    height: 100%;
    overflow: hidden;
}
.member-style,.member-style-content{
    height: 100%;
    overflow: hidden;
}
.side-tabs{
    flex: batchXpTarlationRPX(0,0,90);
    width: batchXpTarlationRPX(90);
    background-color: $theme-background;
    font-size: batchXpTarlationRPX(14);
}
.tab-content{
    flex: 1;
    background-color: #ffffff;
    height: calc(100% - 56px);
    overflow: hidden;
}
.side-tab-item{
    height: batchXpTarlationRPX(45);
    display: flex;
    justify-content: center;
    align-items: center;
    &.active{
        background-color: #ffffff;
        color: $theme-color;
    }
}

.tab-content-item{
    display: flex;
    padding: batchXpTarlationRPX(15,0,15,18);
    border-bottom: batchXpTarlationRPX(1) dashed #bbbbbb;
    justify-content: space-between;
    background-color: #fff;
    &:last-child{
        border-bottom:none;
    }
}
.image{
    flex: batchXpTarlationRPX(0,0,80);
    width: batchXpTarlationRPX(80);
    height: batchXpTarlationRPX(80);
    border-radius: batchXpTarlationRPX(10);
    overflow: hidden;
    margin-right: batchXpTarlationRPX(15);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    image{
        width: 100%;
        height: 100%;
    }
}

.info{
    flex: 1;
}

.info-content{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
}

.info-top{
    display: flex;
    font-size: batchXpTarlationRPX(18);
}

.info-footer{
    font-size: batchXpTarlationRPX(12);
}

.nick-name{
    flex: batchXpTarlationRPX(0,0,80);
    width: batchXpTarlationRPX(80);
}

.post-list {
    flex: 1;
    .post-name .uni-tag{
        display: inline-block;
        background-color: $theme-color;
        border-color: $theme-color;
    }
}
page{
    height: 100%;
}
.tab-scroll-view{
    height: 100%;
}
</style>