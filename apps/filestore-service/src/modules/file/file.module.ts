import {
  HttpStatus,
  Module,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import { AllConfigType } from '../../config/config.type';
import { FILE_COMMAND_HANDLERS } from './commands/handlers';
import { PostGreSQLModule } from '../store/postgresql.module';
import { KafkaModule } from '../kafka/kafka.module';
import * as multer from 'multer';
import { FileService } from './file.service';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
@Module({
  imports: [
    PostGreSQLModule,
    MulterModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        return {
          fileFilter: (request, file, callback) => {
            if (!file.originalname.match(/\.(xlsx|csv)$/i)) {
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
          storage: multer.memoryStorage(),
          limits: {
            fileSize: configService.get('file.maxFileSize', { infer: true }),
          },
        };
      },
    }),
    KafkaModule,
  ],
  controllers: [FileController],
  providers: [...FILE_COMMAND_HANDLERS, FileService],
  exports: [],
})
export class FileModule {}
