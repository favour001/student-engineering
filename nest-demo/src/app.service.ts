import { Injectable, Logger } from '@nestjs/common';
// import { Logger } from './logger/logger';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    this.logger.error('getHello error')
    return 'Hello World!';
  }
}
