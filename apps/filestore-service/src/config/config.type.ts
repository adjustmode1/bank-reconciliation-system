import { RedisConfig } from 'src/modules/cache/config/redis.config.type';
import { FileConfig } from '../modules/file/config/file.config.type';
import { AppConfig } from './app.config.type';
import { AuthConfig } from 'src/modules/auth/config/auth.config.type';
import { PostGresQLConfig } from 'src/modules/store/config/postgresql.config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  file: FileConfig;
  redis: RedisConfig;
  postgres: PostGresQLConfig;
};
