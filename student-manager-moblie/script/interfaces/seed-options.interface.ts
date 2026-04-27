export interface SeedOptions {
  force?: boolean;        // 强制执行，覆盖已存在数据
  clean?: boolean;        // 执行前清理数据
  dryRun?: boolean;       // 预演模式，不实际执行
  verbose?: boolean;      // 详细日志
  configFile?: string;    // 配置文件路径
  batch?: number;         // 批处理大小
  module?: string;        // 指定模块
}