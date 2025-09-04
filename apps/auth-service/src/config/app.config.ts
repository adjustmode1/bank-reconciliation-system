import { registerAs } from '@nestjs/config';
import { AppConfig } from './app.config.type';
import validateConfig from '../modules/utils/validate-config';
import { IsInt, IsString, Max, Min } from 'class-validator';

class EnvironmentVariablesValidator {
  @IsInt()
  @Min(0)
  @Max(65535)
  APP_PORT!: number;

  @IsString()
  API_PREFIX!: string;

  @IsString()
  APP_SWAGGER_ENDPOINT!: string;
}

export default registerAs<AppConfig>('app', (): AppConfig => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    port: process.env.APP_PORT
      ? parseInt(process.env.APP_PORT, 10)
      : process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : 3000,
    apiPrefix: process.env.API_PREFIX || 'api',
    swaggerEndpoint: process.env.APP_SWAGGER_ENDPOINT || 'documentation',
  };
});
