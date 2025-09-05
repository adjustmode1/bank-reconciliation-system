import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../../config/config.type';
import { JwtTokenResponse } from '../responses/jwt-token.response';
import { UserRepository } from '../../../modules/store/repositories/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly config: ConfigService<AllConfigType>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('auth.jwtSecret', { infer: true }),
    });
  }

  async validate(payload: JwtTokenResponse) {
    const user = await this.userRepository.getOneByUsername(payload.username);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { ...payload };
  }
}
