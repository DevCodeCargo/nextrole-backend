import { Injectable, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { AppException } from '../../common/exceptions/app.exception';
import { LoginDto } from './login.dto';
import knex, { Knex } from 'knex';
import { PasswordService } from '../security/password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly platformDb: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) { }

  async login(dto: LoginDto) {

    const result: LoginDto = await this.platformDb.db<LoginDto>('user_accounts')
      .join('user_auth', 'user_auth.user_id', '=', 'user_accounts.user_id')
      .select(
        this.platformDb.db.ref('user_id').withSchema('user_accounts').as('user_id'),
        this.platformDb.db.ref('password_hash').withSchema('user_auth').as('password'),
      )
      .whereRaw('user_accounts.user_name = ?', dto.username)
      .first();

    if (result == undefined) {
      throw new AppException(
        'Invalid User',
        'INVALID_USER',
        HttpStatus.FORBIDDEN,
      );
    }

    const valid = await this.passwordService.compare(
      dto.password,
      result.password,
    );

    if (valid == false) {
      throw new AppException(
        'Invalid User or Password',
        'INVALID_USER',
        HttpStatus.FORBIDDEN,
      );
    }

    const payload = {
      sub: result.user_id,
      username: dto.username,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
    };
  }
}
