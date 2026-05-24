import { IsString, IsNotEmpty, IsEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmpty()
  user_id?: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}



export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}