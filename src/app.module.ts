import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { InternalTestModule } from './modules/internal-test/internal-test.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { GlobalAuthGuard } from './common/auth/auth.guard';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { AuthModule } from './common/auth/auth.module';
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filter';
import { DomainsModule } from './modules/domains.module';
import { AppValidationPipe } from './common/pipes/validation.pipe';
import { SuccessResponseInterceptor } from './common/helper/success-response.interceptor';
import { StartupModule } from './common/startup/startup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PG_HOST: Joi.string().required(),
        PG_PORT: Joi.number().required(),
        PG_USER: Joi.string().required(),
        PG_PASSWORD: Joi.string().required(),
        PG_DATABASE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string()
          .pattern(/^\d+[smhdwy]$/)
          .default('15m'),
        //PG_SSL: Joi.boolean().required()
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') as StringValue,
        },
      }),
    }),
    DatabaseModule,
    StartupModule,
    AuthModule,
    DomainsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: AppValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseInterceptor,
    }
  ]
})

export class AppModule { }