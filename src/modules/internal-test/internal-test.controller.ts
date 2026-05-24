import { Controller, Get, Query } from '@nestjs/common';
import { InternalTestService } from './internal-test.service';
import { Knex } from 'knex';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PasswordService } from 'src/common/security/password.service';
import { DatabaseService } from 'src/database/database.service';

@Controller('internal-test')
export class InternalTestController {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly service: InternalTestService,
    private _passwordService: PasswordService,
  ) { }

  @Get('secure-test')
  async secureTest(
    @Query('password') password: string,
  ) {

    const obj = await this.service.testDbConnection(this.dbService.db);

    if (password) {
      const password_hashed = await this._passwordService.hash(password);
      obj.password_hashed = password_hashed;
    }

    return obj;
  }
}
