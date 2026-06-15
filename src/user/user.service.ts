import { AuthUser, UserRole } from './user.types';
import { UpdateUserDTO } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import type { UserWhereInput } from 'prisma/src/generated/prisma/models';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterUserDTO } from 'src/auth/dto/register.dto';

interface FindAllUsersArgs {
  role?: UserRole;
  page: number;
  limit: number;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async registerUser(registerUserDTO: RegisterUserDTO) {
    const { name, email, password } = registerUserDTO;

    const key = `user:${email}`;
    const value = { name, email, password };

    // await this.cacheManager.set(key, JSON.stringify(value));

    return { user: value, key };
  }

  async findAll(args: FindAllUsersArgs) {
    const { role, page, limit } = args;

    // 1. Calculate pagination offsets
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    // 2. Build dynamic where clause
    const where: UserWhereInput = {};
    if (role) {
      where.role = role;
    }

    const [users, totalCount] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        omit: { password: true },
        where,
        take,
        skip,
        orderBy: { id: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      meta: {
        total: totalCount,
        itemCount: users.length,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    };
  }

  async findUserById(id: string): Promise<AuthUser> {
    if (!id.trim()) {
      throw new BadRequestException('The user id is missing.');
    }

    const user = await this.prisma.user.findUnique({
      omit: { password: true },
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async searchUsersByName(query: string) {
    if (!query.trim()) {
      throw new BadRequestException('The search param is empty.');
    }

    const users = await this.prisma.user.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      omit: { password: true },
      take: 10,
    });

    return users;
  }

  async updateUserById(id: string, data: UpdateUserDTO): Promise<AuthUser> {
    if (!id.trim()) {
      throw new BadRequestException('The user id is missing.');
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('The name or password is missing.');
    }

    const user = await this.prisma.user.update({
      data,
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async deleteUserById(id: string): Promise<{ message: string }> {
    if (!id.trim()) {
      throw new BadRequestException('The user id is missing.');
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User account removed successfully.' };
  }
}
