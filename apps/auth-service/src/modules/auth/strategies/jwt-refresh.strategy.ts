import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../../config/config.type';
import { UserRefreshTokenRepository } from '../../store/repositories/user-refresh-token.repository';
import { JwtTokenResponse } from '../responses/jwt-token.response';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly config: ConfigService<AllConfigType>,
    private userRefreshRepository: UserRefreshTokenRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      passReqToCallback: true,
      secretOrKey: config.getOrThrow('auth.jwtSecret', { infer: true }),
    });
  }

  async validate(
    req: Request,
    payload: JwtTokenResponse,
  ): Promise<Record<string, unknown>> {
    const refreshToken = req.body.refreshToken as unknown as string;
    const user = await this.userRefreshRepository.getRefreshToken(refreshToken);
    if (!user) throw new UnauthorizedException();

    return { ...payload, refreshToken };
  }
}
