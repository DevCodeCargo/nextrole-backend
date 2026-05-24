import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { LoggerService } from 'src/common/logger/logger.service';

@Global()
@Module({
  providers: [
    DatabaseService,
    LoggerService,
  ],
  exports: [DatabaseService, LoggerService],
})
export class DatabaseModule { }
