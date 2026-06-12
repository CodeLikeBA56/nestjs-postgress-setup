import { Request } from 'express';
import { AuthUser } from 'src/user/user.types';

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
