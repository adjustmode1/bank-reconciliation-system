import { registerAs } from '@nestjs/config';

import { IsInt, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { RedisConfig } from './redis.config.type';

class EnvironmentVariablesValidator {
  @IsInt()
  REDIS_PORT!: number;

  @IsString()
  REDIS_HOST!: string;

  @IsString()
  REDIS_PASSWORD!: string;

  @IsString()
  REDIS_USERNAME!: string;
}

export default registerAs<RedisConfig>('redis', (): RedisConfig => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    host: process.env.REDIS_HOST ?? 'localhost',
    password: process.env.REDIS_PASSWORD ?? 'default',
    username: process.env.REDIS_USERNAME ?? 'default',
  };
});
