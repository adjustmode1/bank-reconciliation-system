import { PostGresQLConfig } from 'src/modules/store/config/postgresql.config.type';
import { AppConfig } from './app.config.type';

export type AllConfigType = {
  app: AppConfig;
  postgres: PostGresQLConfig;
};
