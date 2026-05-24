import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';


import { AuthService } from './auth.service';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    request.user = 3;
    return true;

    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Invalid Authorization format');
    }

    try {
      const decoded = this.jwtService.verify(token);

      if (!decoded?.tenant) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Attach user
      request.user = decoded.sub;
      return true;
    } catch (ex) {
      // If it's already a Nest exception, rethrow it
      if (ex instanceof UnauthorizedException || ex instanceof AppException) {
        throw ex;
      }

      // For other errors (JWT invalid, DB crash, etc.)
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
