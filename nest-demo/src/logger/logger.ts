import { ConsoleLogger, Injectable } from '@nestjs/common';


@Injectable()
export class Logger extends ConsoleLogger {
    error(message: unknown, stack?: unknown, context?: unknown): void {
        console.log(message) 
        message = message + ' 环境：dev'
        super.error(message, stack, context);
    }

}
