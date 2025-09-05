import { registerAs } from '@nestjs/config';

import { IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { AuthConfig } from './auth.config.type';

class EnvironmentVariablesValidator {
  @IsString()
  AUTH_JWT_REFRESH_SECRET!: string;
}

export default registerAs<AuthConfig>('auth', (): AuthConfig => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    jwtSecret: process.env.AUTH_JWT_REFRESH_SECRET ?? 'JWT_SECRET',
  };
});
