import { AuthUser } from 'src/user/user.types';
import { AuthenticatedRequest } from '@common/types/authenticated-request.interface';
import { ExecutionContext, createParamDecorator, UnauthorizedException } from '@nestjs/common';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

  const user = request.user;

  if (!user) {
    throw new UnauthorizedException('It looks like your session has expired. Please log in again.');
  }

  return user;
});
