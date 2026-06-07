import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async register(@Body() registerUserDTO: RegisterDTO) {
    return this.authService.register(registerUserDTO);
  }
}
