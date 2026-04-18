/**
* @description: 响应码
*/
export enum RESPONSE_CODE {
  NOSUCCESS = -1, // 表示请求成功，但操作未成功
  SUCCESS = 200, // 请求成功
  BAD_REQUEST = 400, // 请求错误
  UNAUTHORIZED = 401, // 未授权
  FORBIDDEN = 403, // 禁止访问
  NOT_FOUND = 404, // 资源未找到
  INTERNAL_SERVER_ERROR = 500, // 服务器错误
}

/**
* @description: 请求提示语
*/
export enum RESPONSE_MSG {
  SUCCESS = '请求成功',
  FAILURE = '请求失败',
}

/**
* @description: 状态码对应的自定义消息映射
*/
export const STATUS_CODE_MESSAGE_MAP: Record<number, string> = {
  400: '请求参数有误',
  401: '身份验证失败，请重新登录',
  403: '权限不足，无法访问该资源',
  404: '请求的资源不存在',
  405: '请求方法不被允许',
  409: '请求冲突，资源已存在',
  422: '请求数据验证失败',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误，请联系管理员',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时'
};