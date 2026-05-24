import {
  Injectable,
  ValidationPipe,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';

import { AppException } from '../exceptions/app.exception';

@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {

    super({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      disableErrorMessages: false,
      exceptionFactory: (errors) => {
        const formatted = errors.map((err) => ({
          field: err.property,
          errors: Object.values(err.constraints ?? {}),
        }));

        return new AppException('Validation failed', "BAD_REQUEST", HttpStatus.BAD_REQUEST, formatted);
      },
    });
  }
}