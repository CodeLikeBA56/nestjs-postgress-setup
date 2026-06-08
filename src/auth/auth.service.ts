import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDTO } from './dto/login.dto';
import { RegisterUserDTO } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

interface TokenPayload {
  id: string;
  role: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDTO: RegisterUserDTO) {
    const { name, email, password } = registerUserDTO;

    // 1. Check whether user with the email already exists or not?
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. If exists throw conflict error.
    if (existingUser) {
      throw new ConflictException('The user with this email already exists.');
    }

    // 3. If not hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;

    return {
      user: result,
      message: 'User registered successfully.',
    };
  }

  async login(loginUserDTO: LoginUserDTO) {
    try {
      const user = await this.validateUser(loginUserDTO);

      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = await this.generateAccessToken(tokenPayload);
      const refreshToken = await this.generateRefreshToken(tokenPayload);

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      return new InternalServerErrorException('Internal server error: ' + (error as Error).message);
    }
  }

  private async validateUser(loginUserDTO: LoginUserDTO) {
    const { email, password } = loginUserDTO;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('The email or password is incorrect.');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('The email or password is incorrect.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;

    return result;
  }

  private async generateAccessToken(tokenPayload: TokenPayload) {
    return await this.jwtService.signAsync(tokenPayload, { expiresIn: '1h' });
  }

  private async generateRefreshToken(tokenPayload: TokenPayload) {
    return await this.jwtService.signAsync(tokenPayload, { expiresIn: '7d' });
  }

  private async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('The access token is invalid');
    }
  }

  private async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('The refresh token is invalid');
    }
  }
}
