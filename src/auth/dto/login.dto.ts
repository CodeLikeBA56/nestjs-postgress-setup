import { IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class LoginUserDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
