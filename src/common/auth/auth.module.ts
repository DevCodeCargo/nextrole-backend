import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from '../security/password.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PasswordService],
  exports: [PasswordService, AuthService],
})
export class AuthModule {}
