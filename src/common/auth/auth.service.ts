import { Injectable, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { AppException } from '../../common/exceptions/app.exception';
import { EmailCheckDto, LoginDto, RegisterDto } from './login.dto';
import knex, { Knex } from 'knex';
import { PasswordService } from '../security/password.service';

interface UserAuthRecord {
  user_id: string;
  password?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly platformDb: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) { }


  async register(dto: RegisterDto) {

    const result = await this.checkEmailFromDB(dto.email);

    if (result !== undefined) {
      throw new AppException(
        'User Already Exist',
        'USER_ALREADY_EXIST',
        HttpStatus.NOT_ACCEPTABLE
      );
    }

    const password_hash = await this.passwordService.hash(dto.password);

    await this.platformDb.db('users').insert({
      email: dto.email,
      role: 'User',
      password_hash: password_hash
    });

    return {
      success: true,
      message: 'User registered successfully'
    };
  }

  async login(dto: LoginDto) {

    const result = await this.checkEmailFromDB(dto.username);

    if (result == undefined) {
      throw new AppException(
        'Invalid User',
        'INVALID_USER',
        HttpStatus.FORBIDDEN,
      );
    }

    const valid = await this.passwordService.compare(
      dto.password,
      result.password!,
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

  async checkEmail(dto: EmailCheckDto): Promise<boolean> {

    const result = await this.checkEmailFromDB(dto.email);

    return result ? true : false;

  }

  private async checkEmailFromDB(emailId: string): Promise<UserAuthRecord | undefined> {
    const result = await this.platformDb.db('users')
      .select(
        this.platformDb.db.ref('id').withSchema('users').as('user_id'),
        this.platformDb.db.ref('password_hash').withSchema('users').as('password')
      )
      .whereRaw('users.email = ?', emailId)
      .first() as UserAuthRecord | undefined;

    return result;
  }
}
