import { Injectable, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { AppException } from '../../common/exceptions/app.exception';
import { LoginDto } from './login.dto';
import knex, { Knex } from 'knex';
import { PasswordService } from '../security/password.service';

interface UserAuthRecord {
  user_id: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly platformDb: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) { }

  async login(dto: LoginDto) {

    const result = await this.platformDb.db('users')
      .select(
        this.platformDb.db.ref('id').withSchema('users').as('user_id'),
        this.platformDb.db.ref('password_hash').withSchema('users').as('password')
      )
      .whereRaw('users.email = ?', dto.username)
      .first() as UserAuthRecord | undefined;

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
