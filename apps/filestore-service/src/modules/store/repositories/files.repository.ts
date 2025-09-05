import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../entities/file.entity';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../../config/config.type';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class FileRepository {
  private readonly logger = new Logger(FileRepository.name);
  private readonly domain: string;

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
    private readonly config: ConfigService<AllConfigType>,
  ) {
    this.domain = config.getOrThrow('file.fileDomain', { infer: true });
  }

  async createFile(
    file: Express.MulterS3.File,
    username: string,
  ): Promise<FileEntity | Error> {
    try {
      this.logger.verbose('.createFile', {
        fileName: file.originalname,
        filePath: `${this.domain}://${file.bucket}/${file.key}`,
        fileType: file.mimetype,
        size: file.size,
        uploadedBy: username,
      });

      const fileEntity = this.fileRepo.create({
        fileName: file.originalname,
        filePath: `${this.domain}://${file.bucket}/${file.key}`,
        fileType: file.mimetype,
        size: file.size,
        user: { username } as UserEntity,
      });

      const savedFile = await this.fileRepo.save(fileEntity);

      return savedFile;
    } catch (e) {
      this.logger.error('.createFile', e);
      return new Error('Database Occurs Exception');
    }
  }
}
