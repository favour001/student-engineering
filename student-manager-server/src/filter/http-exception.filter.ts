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

    const exceptionResponse = exception.getResponse?.();
    const exceptionMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : Array.isArray(exceptionResponse?.message)
          ? exceptionResponse.message.join('；')
          : exceptionResponse?.message || exception.message;
    const customMessage = status === 400 ? exceptionMessage : STATUS_CODE_MESSAGE_MAP[status] || exceptionMessage;

    response.status(status).json(responseMessage(null, status, customMessage))
  }
}
