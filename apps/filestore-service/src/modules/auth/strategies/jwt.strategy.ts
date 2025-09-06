import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../cache/cache.service';
import { AllConfigType } from 'src/config/config.type';
import { JwtTokenResponse } from '../responses/jwt-token.response';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly config: ConfigService<AllConfigType>,
    private readonly cacheService: CacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('auth.jwtSecret', { infer: true }),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtTokenResponse) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s/, '');

    const isBlacklisted = await this.cacheService.get(`black${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return { ...payload };
  }
}
