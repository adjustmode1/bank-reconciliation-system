import { registerAs } from '@nestjs/config';

import { IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { AuthConfig } from './auth.config.type';

class EnvironmentVariablesValidator {
  @IsString()
  AUTH_JWT_REFRESH_SECRET!: string;

  @IsString()
  AUTH_PRIVATE_KEY_HASH_PASSWORD!: string;

  @IsString()
  AUTH_JWT_REFRESH_TTL!: string;

  @IsString()
  AUTH_JWT_ACCESS_TTL!: string;
}

export default registerAs<AuthConfig>('auth', (): AuthConfig => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    jwtSecret: process.env.AUTH_JWT_REFRESH_SECRET ?? 'JWT_SECRET',
    jwtAccessTTL: process.env.AUTH_JWT_REFRESH_TTL ?? '1m',
    jwtRefreshTTL: process.env.AUTH_JWT_ACCESS_TTL ?? '1d',
    privateKeyHashPassword:
      process.env.AUTH_PRIVATE_KEY_HASH_PASSWORD ?? 'MySecurePassword',
  };
});
