import {
  HttpStatus,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';
import { AppException } from 'src/common/exceptions/app.exception';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private knexInstance!: Knex;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) { }

  async onModuleInit() { }

  async connect_platform_db() {
    this.knexInstance = knex({
      client: 'pg',
      connection: {
        host: this.configService.get<string>('PG_HOST'),
        port: this.configService.get<number>('PG_PORT'),
        user: this.configService.get<string>('PG_USER'),
        password: this.configService.get<string>('PG_PASSWORD'),
        database: this.configService.get<string>('PG_DATABASE'),
        ssl: this.configService.get<boolean>('PG_SSL'),
      },
      pool: {
        min: 1,
        max: 2,
      },
    });

    await this.knexInstance.raw('select 1');
    this.logger.info('Platform DB Connected: ' + DatabaseService.name);
  }

  get db(): Knex {
    return this.knexInstance;
  }

  async execute<T = any>(queryBuilder: Knex.QueryBuilder): Promise<T> {
    try {
      return await queryBuilder;
    } catch (error: any) {
      this.logger.error('Database execution error', {
        message: error.message,
        code: error.code,
      });

      throw new AppException(
        'Database operation failed',
        'DB_ERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async transaction<T>(
    handler: (trx: Knex.Transaction) => Promise<T>,
  ): Promise<T> {
    return this.knexInstance.transaction(async (trx) => {
      return handler(trx);
    });
  }

  async onModuleDestroy() {
    await this.knexInstance.destroy();
  }
}
