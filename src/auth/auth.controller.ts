import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login.dto';
import { RegisterUserDTO } from './dto/register.dto';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() registerUserDTO: RegisterUserDTO) {
    return this.authService.register(registerUserDTO);
  }

  @Post('/login')
  async login(@Body() loginUserDTO: LoginUserDTO) {
    return this.authService.login(loginUserDTO);
  }
}
