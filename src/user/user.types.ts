import { User } from '@prisma/client';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export type AuthUser = Omit<User, 'password'>;
