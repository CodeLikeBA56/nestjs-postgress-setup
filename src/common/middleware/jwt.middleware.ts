import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { Request, Response, NextFunction } from 'express';
import { Logger, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JwtMiddleware.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const cookies = req.cookies as Record<string, string> | undefined;
    let token = cookies?.accessToken;

    if (!token && req.headers.authorization) {
      const [type, headerToken] = req.headers.authorization.split(' ');
      if (type === 'Bearer') {
        token = headerToken;
      }
    }

    if (!token) {
      next();
    }

    try {
      const payload = await this.authService.verifyAccessToken(token!);
      const user = await this.userService.findUserById(payload.id);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      req['user'] = user;
      next();
    } catch (error: unknown) {
      this.logger.error(
        `JWT Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (cookies?.accessToken) {
        res.clearCookie('accessToken');
      }
    }

    return next();
  }
}
