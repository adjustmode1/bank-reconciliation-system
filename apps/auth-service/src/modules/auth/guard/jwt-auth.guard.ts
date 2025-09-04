import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  /* eslint-disable @typescript-eslint/no-unsafe-return */
  handleRequest(err, user, info) {
    if (err || !user) {
      // info chứa thông tin lỗi từ passport-jwt
      if (info instanceof TokenExpiredError) {
        throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      }
      if (info?.message === 'No auth token') {
        throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
      }

      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
