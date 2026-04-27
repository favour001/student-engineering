<script lang="ts">
export default {
    globalData:{
        token:uni.getStorageSync("token"),
        userId:uni.getStorageSync("userId"),
        toLogin:true,
        card:{
          cardId:'',
          type:''
        }
    },
    onLaunch:(() => {
        console.log("App Launch");
    }),
    onShow:(() => {
    // uni.hideTabBar();
    console.log("App Show");
    }),
    onHide:(() => {
        console.log("App Hide");
    })
}
</script>
<style></style>
