import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login.dto';
import { RegisterUserDTO } from './dto/register.dto';
import { Body, Controller, Post, Res } from '@nestjs/common';
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
import { Public } from '@common/decorators/public-route.decorator';

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
  @Public()
  @ApiOperation({
    summary: 'Login user',
    description: 'Login to the system by providing the registered email and password.',
  })
  @ApiOkResponse({ description: 'Logged in successfully.' })
  @ApiNotFoundResponse({ description: 'The user with the email is not found!' })
  @ApiUnauthorizedResponse({ description: 'The email or password is incorrect.' })
  async login(@Res({ passthrough: true }) res: Response, @Body() loginUserDTO: LoginUserDTO) {
    const result = await this.authService.login(loginUserDTO);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return result;
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'You have been logged out successfully' })
  async logout() {}
}
