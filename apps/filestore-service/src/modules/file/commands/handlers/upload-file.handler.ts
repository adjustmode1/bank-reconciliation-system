import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { UploadFileCommand } from '../impl/upload-file.command';
import { FileRepository} from '../../../store/repositories/files.repository';

@CommandHandler(UploadFileCommand)
export class UploadFileHandler implements ICommandHandler<UploadFileCommand> {
  private readonly logger = new Logger(UploadFileHandler.name);

  constructor(
    private readonly fileRepo: FileRepository,
  ) {}

  async execute(data: UploadFileCommand): Promise<string | Error> {
    this.logger.verbose('.execute', { fileName: data.file.fieldname });

    const fileResult = await this.fileRepo.createFile(data.file, data.username);

    if (fileResult instanceof Error) {
      throw new HttpException(
        fileResult.message,
        HttpStatus.BAD_REQUEST,
      );
    }

    return fileResult.filePath;
  }
}
