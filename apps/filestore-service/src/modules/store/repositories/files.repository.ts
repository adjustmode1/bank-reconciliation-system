import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../entities/file.entity';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../../config/config.type';
import { UserEntity } from '../entities/user.entity';
import { FileStatusEnum } from '../enums/file-status.enum';

@Injectable()
export class FileRepository {
  private readonly logger = new Logger(FileRepository.name);
  private readonly domain: string;
  private readonly bucket: string;

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
    private readonly config: ConfigService<AllConfigType>,
  ) {
    this.domain = config.getOrThrow('file.fileDomain', { infer: true });
    this.bucket = this.config.getOrThrow<string>('file.defaultMinioBucket', {
      infer: true,
    });
  }

  async createFile(
    originalname: string,
    mimeType: string,
    size: number,
    key: string,
    username: string,
  ): Promise<FileEntity | Error> {
    try {
      this.logger.verbose('.createFile', {
        fileName: originalname,
        filePath: `${this.domain}://${this.bucket}/${key}`,
        fileType: mimeType,
        size: size,
        uploadedBy: username,
      });

      const fileEntity = this.fileRepo.create({
        fileName: originalname,
        filePath: `${this.domain}://${this.bucket}/${key}`,
        fileType: mimeType,
        size: size,
        user: { username } as UserEntity,
        fileStatus: FileStatusEnum.CREATED,
      });

      const savedFile = await this.fileRepo.save(fileEntity);

      return savedFile;
    } catch (e) {
      this.logger.error('.createFile', e);

      return new Error('Database Occurs Exception');
    }
  }

  async updateStatusFile(
    fileId: string,
    fileStatus: FileStatusEnum,
  ): Promise<FileEntity | null | Error> {
    try {
      this.logger.verbose('.updateStatusFile', {});

      await this.fileRepo.update(
        { fileId: fileId },
        { fileStatus: fileStatus },
      );

      return await this.fileRepo.findOne({ where: { fileId } });
    } catch (error) {
      this.logger.error('.findFileForSync', (error as Error).message);

      return new Error('Database Occurs Exception');
    }
  }

  async findFileForSync(filePath: string): Promise<FileEntity | null | Error> {
    try {
      this.logger.verbose('.findFileForSync', {});

      return await this.fileRepo.findOne({
        where: { filePath, fileStatus: FileStatusEnum.CREATED },
      });
    } catch (error) {
      this.logger.error('.findFileForSync', (error as Error).message);

      return new Error('Database Occurs Exception');
    }
  }
}
