
const baseURL = 'https://sdsosa.com'
// const baseURL = 'http://localhost:5398'
const commonRequest = (method:string = 'GET',url:string,header?:any,data?:any,isShowModel?:boolean) => {
    // uni.showLoading({
    //     title:'加载中',
    //     mask:true
    // })
    if (header && header.hasOwnProperty("token") && !header.token){
        uni.hideLoading()
        uni.showModal({
            title: '温馨提示',
            content: '登录后享受更多功能',
            showCancel: false
        })
        return false
    }

    let headerParam = {
        "content-type":"application/json"
    }
    if (!header){
        header = Object.assign(headerParam,header)
    }

    return new Promise((resolve, reject) =>{
        uni.request({
            method,
            url:`${baseURL}/nsx-api/${url}`,
            header:header || {},
            data:data || {},
            success:(res) => {
                uni.hideLoading()
                let result:any = res.data;
                if (result.code == 200){
                    if (result?.data){
                        resolve(result.data)
                    }else {
                        resolve(true)
                    }
                }else {
                    reject(false)
                    if (!isShowModel){
                        uni.showModal({
                            title: '温馨提示',
                            content: result.msg,
                            showCancel: false
                        })
                    }
                }
            }
        })
    })

}

export { commonRequest, baseURL};
