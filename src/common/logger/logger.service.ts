import { Global, Injectable } from '@nestjs/common';
import pino from 'pino';

@Global()
@Injectable()
export class LoggerService {
  private readonly logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
        : undefined,
  });

  info(message: string, meta?: any) {
    this.logger.info(meta || {}, message);
  }

  error(message: any, meta?: any) {
    this.logger.error(meta || {}, message);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(meta || {}, message);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(meta || {}, message);
  }
}
