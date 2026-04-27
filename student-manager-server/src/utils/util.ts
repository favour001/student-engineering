const compare = (attr:any, rev:any) => {
    // console.log(attr, rev)
    if (rev == undefined) {
        rev = 1;
    } else {
        rev = (rev) ? 1 : -1;
    }
    return (a:string, b:string) => {
        a = a[attr];
        b = b[attr];
        if (a < b) {
            return rev * -1;
        }
        if (a > b) {
            return rev * 1;
        }
        return 0;
    }
}

const transformtimeStamp = (timestamp:number):Date => {
    const date = new Date(timestamp)
    return date;
}

const getDate = (timestamp:number) => {
    let date:Date = transformtimeStamp(timestamp);
    let year = date.getFullYear();
    let month = ( date.getMonth() + 1 ) > 9 ? ( date.getMonth() + 1 ) : `0${( date.getMonth() + 1 )}`;
    let day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    return `${year}-${month}-${day}`
}

const getDateTime = (timestamp:number,connect:string) => {
    let date:Date = transformtimeStamp(timestamp);
    let year = date.getFullYear();
    let month = date.getMonth() > 9 ? date.getMonth() : `0${date.getMonth()}`;
    let day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    let hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
    let minutes = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
    let seconds = date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const handleImageUrl = (imageUrl:string) => {
    const reg = /\/nsx-api(\S*)/
    if (imageUrl && imageUrl.indexOf("/nsx-api/image/") > -1){
        // @ts-ignore
        return imageUrl.match(reg)[1];
    }else {
        return imageUrl
    }
}

export { compare, getDate, getDateTime, handleImageUrl };
