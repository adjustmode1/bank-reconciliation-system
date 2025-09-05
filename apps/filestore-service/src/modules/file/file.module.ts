import {
  HttpStatus,
  Module,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

import { AllConfigType } from '../../config/config.type';
import { FILE_COMMAND_HANDLERS } from './commands/handlers';
import { PostGreSQLModule } from '../store/postgresql.module';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    PostGreSQLModule,
    MulterModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const s3 = new S3Client({
          endpoint: configService.getOrThrow<string>('file.endpoint', { infer: true }),
          region: configService.get('file.region', { infer: true }),
          forcePathStyle: true,
          credentials: {
            accessKeyId: configService.getOrThrow('file.accessKeyId', {
              infer: true,
            }),
            secretAccessKey: configService.getOrThrow('file.secretAccessKey', {
              infer: true,
            }),
          },
        });

        return {
          fileFilter: (request, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
              return callback(
                new UnprocessableEntityException({
                  status: HttpStatus.UNPROCESSABLE_ENTITY,
                  errors: {
                    file: `cantUploadFileType`,
                  },
                }),
                false,
              );
            }

            callback(null, true);
          },
          storage: multerS3({
            s3: s3,
            acl: 'private',
            bucket: configService.getOrThrow('file.defaultMinioBucket', {
              infer: true,
            }),
            // eslint-disable-next-line @typescript-eslint/unbound-method
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (request, file, callback) => {
              callback(
                null,
                `${randomStringGenerator()}.${file.originalname
                  .split('.')
                  .pop()
                  ?.toLowerCase()}`,
              );
            },
          }),
          limits: {
            fileSize: configService.get('file.maxFileSize', { infer: true }),
          },
        };
      },
    }),
    KafkaModule,
  ],
  controllers: [FileController],
  providers: [...FILE_COMMAND_HANDLERS],
  exports: [],
})
export class FileModule {}
