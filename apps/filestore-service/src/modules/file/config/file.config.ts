import { registerAs } from '@nestjs/config';

import { IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { FileConfig } from './file.config.type';

class EnvironmentVariablesValidator {
  @IsString()
  MINIO_ENDPOINT!: string;

  @IsString()
  MINIO_ACCESS_KEY_ID!: string;

  @IsString()
  MINIO_SECRET_ACCESS_KEY!: string;

  @IsString()
  MINIO_REGION!: string;

  @IsString()
  MINIO_DEFAULT_BUCKET!: string;

  @IsString()
  MINIO_PUBLISH_URL!: string;

  @IsString()
  FILE_DOMAIN!: string;
}

export default registerAs<FileConfig>('file', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    endpoint: process.env.MINIO_ENDPOINT ?? 'http://127.0.0.1:9000',
    accessKeyId: process.env.MINIO_ACCESS_KEY_ID ?? '7g25JdDg8EAavKzqE9qa',
    secretAccessKey:
      process.env.MINIO_SECRET_ACCESS_KEY ??
      'tPjGwDXav7PbyD7FDQDqAiHvRHUobzcdW4VHVqag',
    defaultMinioBucket: process.env.MINIO_DEFAULT_BUCKET ?? 'file',
    region: process.env.MINIO_REGION ?? 'us-east-1',
    publishURL: process.env.MINIO_PUBLISH_URL ?? 'http://127.0.0.1:9000',
    fileDomain: process.env.fileDomain ?? 'bc',
    maxFileSize: 5242880,
  };
});
