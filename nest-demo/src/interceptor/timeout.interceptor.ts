import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { log } from "console";
import { Observable, tap } from 'rxjs'

export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        log('Timeout:', Date.now() - now)
      })
    )
  }
}