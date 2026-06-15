import type { Response } from 'express';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { IS_PUBLIC_KEY } from '@common/decorators/public-route.decorator';
import { AuthenticatedRequest } from '@common/types/authenticated-request.interface';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    const cookies = request.cookies as Record<string, string> | undefined;
    let token = cookies?.accessToken;

    if (!token && typeof request.headers.authorization === 'string') {
      const [type, headerToken] = request.headers.authorization.split(' ');
      if (type === 'Bearer') {
        token = headerToken;
      }
    }

    if (!token) {
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const payload = await this.authService.verifyAccessToken(token);
      const user = await this.userService.findUserById(payload.id);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = user;
      return true;
    } catch (error: unknown) {
      console.error('JWT guard error:', error);
      if (cookies?.accessToken && response && !response.headersSent) {
        response.clearCookie('accessToken');
      }

      throw new UnauthorizedException('Invalid access token');
    }
  }
}
