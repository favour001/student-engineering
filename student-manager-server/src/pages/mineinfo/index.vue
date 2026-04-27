<template>
  <view class="mine-info">
    <view class="form-box">
      <uni-section title="基本资料" type="line">
        <view class="example">
          <!-- 基础用法，不包含校验规则 -->
          <uni-forms ref="baseForm" :modelValue="userForm">
            <uni-forms-item label="姓名" label-align="right" :label-width="90">
              <uni-easyinput v-model="userForm.userName" placeholder="请输入姓名" />
            </uni-forms-item>
            <uni-forms-item label="英文姓名" label-align="right" :label-width="90">
              <uni-easyinput v-model="userForm.userEnglishName" placeholder="请输入英文姓名" />
            </uni-forms-item>
            <uni-forms-item label="头像" label-align="right" :label-width="90">
              <uni-file-picker :limit="1" v-model="avaterfile"
                               fileMediatype="image"
                               mode="grid" title="最多选择1张图片"
                               @select="selectAvater"/>
            </uni-forms-item>
            <uni-forms-item label="性别" label-align="right" :label-width="90">
              <uni-data-checkbox v-model="userForm.gender" :localdata="sexs" />
            </uni-forms-item>
            <uni-forms-item label="生日日期" label-align="right" :label-width="90">
              <uni-datetime-picker type="date" return-type="timestamp" v-model="userForm.birthday"/>
            </uni-forms-item>
            <uni-forms-item label="联系方式" label-align="right" :label-width="90">
              <uni-easyinput v-model="userForm.mobile" placeholder="请输入联系方式" />
            </uni-forms-item>
            <uni-forms-item label="邮箱" label-align="right" :label-width="90">
              <uni-easyinput v-model="userForm.email" placeholder="请输入邮箱" />
            </uni-forms-item>
          </uni-forms>
        </view>
      </uni-section>
    </view>
    <view class="form-box">
      <uni-section title="学历资料" type="line">
        <view class="example">
          <!-- 基础用法，不包含校验规则 -->
          <uni-forms ref="baseForm" :modelValue="userForm">
            <uni-forms-item label="留学地区" label-align="right" :label-width="90">
              <uni-easyinput v-model="userForm.liuxueGuo" placeholder="请输入留学地区" />
            </uni-forms-item>
            <uni-forms-item label="留学学校" label-align="right" :label-width="90">
              <uni-easyinput v-model="userForm.liuxueSchool" placeholder="请输入留学学校" />
            </uni-forms-item>
            <uni-forms-item label="专业/学位" label-align="right" :label-width="90">
              <uni-easyinput v-model="userForm.major" placeholder="请输入专业/学位" />
            </uni-forms-item>
            <uni-forms-item label="证书" label-align="right" :label-width="90">
              <uni-file-picker :limit="1" v-model="certificatefile"
                               fileMediatype="image"
                               mode="grid" title="最多选择1张图片" @select="selectCertificate"/>
            </uni-forms-item>
          </uni-forms>
        </view>
      </uni-section>
    </view>
    <view class="form-box">
      <uni-section title="社会信息" type="line">
        <view class="example">
          <!-- 基础用法，不包含校验规则 -->
          <uni-forms ref="baseForm" :modelValue="userForm">
            <uni-forms-item label="单位名称" label-align="right" :label-width="90">
              <uni-easyinput v-model="userForm.companyName" placeholder="请输入单位名称" />
            </uni-forms-item>
            <uni-forms-item label="单位职位" label-align="right" :label-width="90">
              <uni-easyinput v-model="userForm.companyPost" placeholder="请输入单位职位" />
            </uni-forms-item>
            <uni-forms-item label="社会职务" label-align="right" :label-width="90">
              <uni-easyinput v-model="userForm.post" placeholder="请输入社会职务" />
            </uni-forms-item>
          </uni-forms>
        </view>
      </uni-section>
    </view>
    <button type="primary" class="form-btn" @click="submit('baseForm')">提交</button>
    <view class="footer"></view>
  </view>
</template>
<script setup lang="ts">
import UniForms from "@/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/components/uni-easyinput/uni-easyinput.vue";
import UniSection from "@/components/uni-section/uni-section.vue";
import UniDataCheckbox from "@/components/uni-data-checkbox/uni-data-checkbox.vue";
import UniDatetimePicker from "@/components/uni-datetime-picker/uni-datetime-picker.vue";
import UniFilePicker from "@/components/uni-file-picker/uni-file-picker.vue";
import { getDate, handleImageUrl } from "@/utils/util"
import { reactive, ref} from "vue";
import { commonRequest, baseURL } from "@/utils/request";
import {onLoad} from "@dcloudio/uni-app";

// const baseFormData = reactive<any>({})

interface Sex {
  text:string,
  value:string
}

const sexs = ref<Array<Sex>>([
  {
    text: '女',
    value: '0'
  }, {
  text: '男',
  value: '1'
  }]
)

const baseForm = ref<any>();

const userForm = reactive<any>({
  id:0,
  userName:'',
  mobile:0,
  userEnglishName:'',
  gender:'',
  email:'',
  liuxueGuo:'',
  liuxueSchool:'',
  major:'',
  companyName:'',
  companyPost:'',
  post:'',
  birthday:'',
  avaterUrl:'',
  certificate:''
});

let avaterfile = reactive<any>([])
let certificatefile = reactive<any>([])

let { token:accessToken } = getApp().globalData as any

const submit = async (ref:any) => {

  if (userForm.birthday){
    userForm.birthday = getDate(userForm.birthday)
  }
  if (avaterfile && avaterfile.length){
    console.log('1'+avaterfile[0])
    userForm.avaterUrl = handleImageUrl(avaterfile[0].url)
  }
  console.log(certificatefile)
  if (certificatefile && certificatefile.length){
    userForm.certificatefile = handleImageUrl(certificatefile[0].url)
  }

  console.log(userForm)
  console.log(avaterfile)
  let res = await commonRequest('POST',`app/wxuser/update`,{token:accessToken},userForm)
  console.log(res)
  if (res){
    uni.showToast({
      title: '修改成功',
      //将值设置为 success 或者直接不用写icon这个参数
      icon: 'success',
      //显示持续时间为 2秒
      duration: 2000
    })
  }
  // baseForm.value.validate().then((res:any) => {
  //   console.log('success', res);
  // }).catch((err:any) => {
  //   console.log('err', err);
  // })
}

const selectCertificate = (e:any) => {
  let { tempFilePaths } = e
  upload(tempFilePaths[0],'certificate')
}

const selectAvater = (e:any) =>{
  console.log('选择文件：',e)
  let { tempFilePaths } = e
  upload(tempFilePaths[0],'avaterUrl')
}

const upload = (filePath:string,type:String) => {
  uni.uploadFile({
    url: `${baseURL}/nsx-api/s/common/upload`, //仅为示例，非真实的接口地址
    filePath: filePath,
    name: 'file',
    formData: {
      'user': 'test'
    },
    success: (res) => {
      console.log(res)
      let { data } = JSON.parse(res.data);
      console.log(data)
      if (type == 'avaterUrl'){
        userForm.avaterUrl = data.url;
        avaterfile = [{
          url:`${baseURL}/nsx-api${data.url}`,
          extname:'png',
          name:'default.png'
        }]
      }else {
        userForm.certificate = data.url;
        certificatefile = [{
          url:`${baseURL}/nsx-api${data.url}`,
          extname:'png',
          name:'default.png'
        }]
      }

    },
    fail: (res) => {

    },
  })
}


onLoad(async (options:any) => {
  let { userId } = options
  let user = await commonRequest('GET',`app/wxuser/get/${userId}`, {token:accessToken}) as any

  for (const userKey in user) {
      if (userKey == 'avaterUrl' && user['avaterUrl']){
        avaterfile = [{
          url:user['avaterUrl'],
          extname:'png',
          name:'default.png'
        }]
        continue;
      }
      if (userKey == 'certificate' && user['certificate']){
        certificatefile = [{
          url:user['certificate'],
          extname:'png',
          name:'default.png'
        }]
        continue;
      }
      if (userForm[userKey] != undefined){
        userForm[userKey] = user[userKey]
      }
  }
})
</script>

<style lang="scss">
@import "/src/static/css/base";
.mine-info{
  padding: batchXpTarlationRPX(16,10,0,10);
  .uni-section .uni-section-header__decoration{
    background-color: $theme-color;
  }
  .form-btn{
    width: 100%;
    background-color: $theme-color;
    font-size: batchXpTarlationRPX(14);
    margin-bottom: batchXpTarlationRPX(10);
  }
}
.form-box{
  margin-bottom: batchXpTarlationRPX(10);
  border-radius: batchXpTarlationRPX(10);
  padding: batchXpTarlationRPX(0,10,10,10);
  background-color: #fff;
}


</style>