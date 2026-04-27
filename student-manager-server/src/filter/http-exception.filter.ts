import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response, Request } from "express";
import { responseMessage } from "./response-message";
import { STATUS_CODE_MESSAGE_MAP } from "./enums";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter{
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();

    // 根据状态码获取自定义消息，如果没有对应的消息则使用异常原始消息
    const customMessage = STATUS_CODE_MESSAGE_MAP[status] || exception.message;


    response.status(status).json(responseMessage(null, customMessage, status))
  }
}