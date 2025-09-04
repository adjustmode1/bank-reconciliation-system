import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../config/config.type';
import { scryptSync } from 'crypto';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly privateKey: Buffer;
  private readonly jwtSecret: string;
  private readonly jwtAccessTTL: string;
  private readonly jwtReFreshTTL: string;

  constructor(
    private readonly config: ConfigService<AllConfigType>,
    private readonly cacheService: CacheService,
    private jwt: JwtService,
  ) {
    const privateKey = config.getOrThrow('auth.privateKeyHashPassword', {
      infer: true,
    });
    this.privateKey = Buffer.from(privateKey, 'utf-8');
    this.jwtSecret = config.getOrThrow('auth.jwtSecret', { infer: true });
    this.jwtAccessTTL = config.getOrThrow('auth.jwtAccessTTL', { infer: true });
    this.jwtReFreshTTL = config.getOrThrow('auth.jwtRefreshTTL', {
      infer: true,
    });
  }

  getCacheKeyJWTBlacklist(token: string): string {
    return `black${token}`;
  }

  async blackJWTAccessToken(token: string): Promise<void> {
    await this.cacheService.set(
      this.getCacheKeyJWTBlacklist(token),
      '',
      'EX',
      this.jwtAccessTTL,
    );
  }

  async blackJWTRefreshToken(token: string): Promise<void> {
    await this.cacheService.set(
      this.getCacheKeyJWTBlacklist(token),
      '',
      'EX',
      this.jwtReFreshTTL,
    );
  }

  async generateRefreshToken(
    payload: Record<string, unknown>,
  ): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtReFreshTTL,
    });
  }

  async generateAccessTokenToken(
    payload: Record<string, unknown>,
  ): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtAccessTTL,
    });
  }

  async getTTLJWTToken(token: string): Promise<Date> {
    try {
      const data = this.jwt.verify(token, {
        secret: this.jwtSecret,
      }) as unknown as { exp?: number };

      if (data?.exp) {
        return new Date(data.exp * 1000);
      }

      return new Date();
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
        const decoded = this.jwt.decode(token) as unknown as { exp?: number };
        if (decoded?.exp) {
          return new Date(decoded.exp * 1000);
        }
      }

      return new Date();
    }
  }

  async hashPassword(password: string) {
    const hashedPassword = scryptSync(
      Buffer.from(password, 'utf8'),
      this.privateKey,
      256,
    );

    return hashedPassword.toString('hex');
  }

  async comparePassword(hashedPassword: string, password: string) {
    const currentHashedPassword = await this.hashPassword(password);

    return hashedPassword === currentHashedPassword;
  }
}
