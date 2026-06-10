import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login.dto';
import { RegisterUserDTO } from './dto/register.dto';
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a user account with default role as member and returns user details',
  })
  @ApiCreatedResponse({ description: 'User registered successfully.' })
  @ApiConflictResponse({ description: 'The user with this email already exists.' })
  async register(@Body() registerUserDTO: RegisterUserDTO) {
    return this.authService.register(registerUserDTO);
  }

  @Post('/login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Login to the system by providing the registered email and password.',
  })
  @ApiOkResponse({ description: 'Logged in successfully.' })
  @ApiNotFoundResponse({ description: 'The user with the email is not found!' })
  @ApiUnauthorizedResponse({ description: 'The email or password is incorrect.' })
  async login(@Body() loginUserDTO: LoginUserDTO) {
    return this.authService.login(loginUserDTO);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'You have been logged out successfully' })
  async logout() {}
}
