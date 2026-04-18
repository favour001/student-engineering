import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { responseMessage } from './response-message';
import { STATUS_CODE_MESSAGE_MAP } from './enums';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // ArgumentsHost叫做参数主机，它是一个实用的工具 这里我们使用 它的一个方法来获取上下文ctx
  catch(exception: any, host: ArgumentsHost) {
    // 获取上下文
    const ctx = host.switchToHttp();
    // 获取响应体
    const response = ctx.getResponse();
    // 获取请求体
    const request = ctx.getRequest();
    // 获取状态码，判断是HTTP异常还是服务器异常
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 优先使用状态码映射的自定义消息
    let message = STATUS_CODE_MESSAGE_MAP[status];
    
    // 如果没有预定义消息，则使用异常原始消息
    if (!message) {
      message = exception instanceof HttpException
        ? JSON.stringify(exception.getResponse())
        : '服务器错误';
    }


    // 自定义异常返回体
    response
      .status(status)
      .json(responseMessage(null, status, message ));
  }
}