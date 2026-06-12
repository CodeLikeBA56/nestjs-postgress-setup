import { AuthUser } from 'src/user/user.types';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthenticatedRequest } from '@common/types/authenticated-request.interface';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
