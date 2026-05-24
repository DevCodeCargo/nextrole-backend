import {
  createParamDecorator,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      throw new AppException(
        'User not attached to request',
        'UserInfoMissing',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    return request.user;
  },
);
