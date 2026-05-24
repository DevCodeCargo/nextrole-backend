import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppException } from '../../common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class InternalTestService {
  constructor(
    private readonly platformDb: DatabaseService
  ) { }

  async testDbConnection(db: Knex) {
    const result = await db.raw('select 1 as connected');

    const obj: any = {
      result: result.rows[0],
    };

    return obj;

  }

}
