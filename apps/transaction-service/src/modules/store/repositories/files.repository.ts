import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../entities/file.entity';
import { FileStatusEnum } from '../enums/file-status.enum';

@Injectable()
export class FileRepository {
  private readonly logger = new Logger(FileRepository.name);

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  async getFileById(fileId: string): Promise<FileEntity | null | Error> {
    try {
      this.logger.verbose('.getFileById', {});

      return await this.fileRepo.findOneBy({ fileId: fileId });
    } catch (e) {
      this.logger.error('.getFileById', e);
      return new Error('Database Occurs Exception');
    }
  }

  async updateStatusCompletedSyncFile(
    fileId: string,
  ): Promise<FileEntity | null | Error> {
    try {
      this.logger.verbose('.updateStatusFile', {});

      await this.fileRepo.update(
        { fileId: fileId },
        { fileStatus: FileStatusEnum.SYNC_COMPLETED },
      );

      return await this.fileRepo.findOne({ where: { fileId } });
    } catch (e) {
      this.logger.error('.updateStatusFile', e);
      return new Error('Database Occurs Exception');
    }
  }

  async updateStatusFalseSyncFile(
    fileId: string,
    reason: string,
  ): Promise<FileEntity | null | Error> {
    try {
      this.logger.verbose('.updateStatusFile', {});

      await this.fileRepo.update(
        { fileId: fileId },
        { fileStatus: FileStatusEnum.SYNC_FAILSED, falseReason: reason },
      );

      return await this.fileRepo.findOne({ where: { fileId } });
    } catch (e) {
      this.logger.error('.updateStatusFile', e);
      return new Error('Database Occurs Exception');
    }
  }
}
