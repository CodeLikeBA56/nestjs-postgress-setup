import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/decorators/public-route.decorator';
import { AuthenticatedRequest } from '@common/types/authenticated-request.interface';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        'It looks like your session has expired. Please log in again.',
      );
    }

    return true;
  }
}
