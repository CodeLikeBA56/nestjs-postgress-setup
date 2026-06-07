import bcrypt from 'bcrypt';
import { RegisterDTO } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(registerUserDTO: RegisterDTO) {
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
}
