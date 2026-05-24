import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../helper/response.helper';
import { AppException } from '../exceptions/app.exception';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService, private readonly configService: ConfigService) { }


  catch(exception: unknown, host: ArgumentsHost) {

    const isProd = this.configService.get("NODE_ENV") === "production";

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const request_summary = {
      method: request.method,
      url: request.originalUrl,
      params: request.params,
      query: request.query,
      body: request.body,
      user: request.user?.user_id,
      ip: request.ip
    };

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof AppException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      message = res.message;
      errorCode = res.errorCode;

      const responseBody: any = ApiResponse.error(message, errorCode);

      if (exception.originalError) {
        const err = exception.originalError;

        const originalErrorObj = {
          originalError:
            err instanceof Error
              ? {
                name: err.name,
                message: err.message,
                stack: err.stack,
              }
              : err
        }

        if (!isProd) {
          responseBody.debug = originalErrorObj
        }

      }

      this.logger.error(responseBody, request_summary);

      return response.status(status).json(responseBody);
    }
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      if (typeof res === 'object') {
        message = res.message || 'Bad Request';
        return response
          .status(status)
          .json(ApiResponse.error(message, exception.name, res.errors));
      }

      message = res;
      errorCode = exception.name;
    }
    else if (exception instanceof Error) {
      this.logger.error("Unhandled exception", {
        message: exception.message,
        stack: exception.stack,
      });

      const responseBody: any = ApiResponse.error(
        "Internal server error",
        "INTERNAL_ERROR",
      );

      if (!isProd) {
        responseBody.debug = {
          message: exception.message,
          stack: exception.stack,
        };
      }

      return response.status(500).json(responseBody);
    }

    response.status(status).json(ApiResponse.error(message, errorCode));
  }
}
