import { registerAs } from '@nestjs/config';

import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { PostGresQLConfig } from './postgresql.config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_USERNAME!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_NAME!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD!: string;

  @IsNumber()
  POSTGRES_PORT!: number;
}

export default registerAs<PostGresQLConfig>(
  'postgres',
  (): PostGresQLConfig => {
    validateConfig(process.env, EnvironmentVariablesValidator);
    return {
      host: process.env.POSTGRES_HOST ?? '127.0.0.1',
      port: process.env.POSTGRES_PORT
        ? parseInt(process.env.POSTGRES_PORT, 10)
        : 10,
      username: process.env.POSTGRES_USERNAME ?? 'postgresuser',
      password: process.env.POSTGRES_PASSWORD ?? 'Abcd#1234',
      dbName: process.env.POSTGRES_NAME ?? 'bank_reconciliation',
    };
  },
);
