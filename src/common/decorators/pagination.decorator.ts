import { AuthenticatedRequest } from '@common/types/authenticated-request.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface PaginationDecoratorResponse {
  page: number;
  limit: number;
}

export const Pagination = createParamDecorator(
  // eslint-disable-next-line @typescript-eslint/require-await
  async (customLimit: number = 10, ctx: ExecutionContext): Promise<PaginationDecoratorResponse> => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    return {
      page: Number(request.query.page) || 1,
      limit: Number(request.query.limit) || customLimit,
    };
  },
);
