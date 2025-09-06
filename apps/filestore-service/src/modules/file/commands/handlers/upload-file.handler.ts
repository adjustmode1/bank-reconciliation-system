import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { UploadFileCommand } from '../impl/upload-file.command';
import { FileRepository } from '../../../store/repositories/files.repository';
import { FileService } from '../../file.service';

@CommandHandler(UploadFileCommand)
export class UploadFileHandler implements ICommandHandler<UploadFileCommand> {
  private readonly logger = new Logger(UploadFileHandler.name);

  constructor(
    private readonly fileRepo: FileRepository,
    private readonly fileService: FileService,
  ) {}

  async execute(data: UploadFileCommand): Promise<string | Error> {
    this.logger.verbose('.execute', { fileName: data.file.originalname });

    await this.fileService.validateAndParseFile(data.file);

    const key = `${Date.now()}-${data.file.originalname}`;
    await this.fileService.uploadToS3(data.file, key);

    const fileResult = await this.fileRepo.createFile(
      data.file.originalname,
      data.file.mimetype,
      data.file.size,
      key,
      data.username,
    );

    if (fileResult instanceof Error) {
      throw new HttpException(fileResult.message, HttpStatus.BAD_REQUEST);
    }

    return fileResult.filePath;
  }
}
