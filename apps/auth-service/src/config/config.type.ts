import { RedisConfig } from 'src/modules/cache/config/redis.config.type';
import { AppConfig } from './app.config.type';
import { AuthConfig } from 'src/modules/auth/config/auth.config.type';
import { PostGresQLConfig } from 'src/modules/store/config/postgresql.config.type';

export type AllConfigType = {
  app: AppConfig;
  redis: RedisConfig;
  auth: AuthConfig;
  postgres: PostGresQLConfig;
};
