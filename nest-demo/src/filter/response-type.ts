  /**
   * @description: 全局响应体
   */
  export type Response<T = any> = {
    code: number; // 状态码
    data?: T; // 业务数据
    msg: string; // 响应信息
    timestamp: string; // 时间戳
  };
  /**
   * @description: 分页数据
   */
  export type PageResponse<T> = {
    current?: number; // 页码
    size?: number; // 当前页条数
    total?: number; // 总条数
    records: T[]; // 业务数据
  };