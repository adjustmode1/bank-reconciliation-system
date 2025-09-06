import {
  Body,
  Controller,
  Logger,
  NotFoundException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UploadFileCommand } from './commands/impl/upload-file.command';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { JwtTokenResponse } from '../auth/responses/jwt-token.response';
import { UploadFileResponse } from './responses/upload-file.response';
import { UnAuthorizationResponse } from '../../responses/un-authorization.response';
import { GetUser } from '../auth/decorators/get-user-info.decorator';
import { FileStoreEventsProducer } from '../kafka/file-store-events.producer';
import { FileService } from './file.service';
import { FileRepository } from '../store/repositories/files.repository';
import { SyncTransactionDto } from './dto/sync-transaction.dto';
import { FileStatusEnum } from '../store/enums/file-status.enum';

@ApiTags('File')
@Controller('file')
export class FileController {
  private readonly logger = new Logger(FileController.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly producer: FileStoreEventsProducer,
    private readonly fileService: FileService,
    private readonly fileRepo: FileRepository,
  ) {}

  @ApiCreatedResponse({
    type: UploadFileResponse,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload-transaction')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiUnauthorizedResponse({ type: UnAuthorizationResponse })
  async uploadFile(
    @GetUser() data: JwtTokenResponse,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadFileResponse> {
    this.logger.verbose('.uploadFile', { username: data.username });

    const filePath = await this.commandBus.execute<UploadFileCommand, string>(
      new UploadFileCommand(file, data.username),
    );

    return {
      data: filePath,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sync-transaction')
  @ApiBody({ type: SyncTransactionDto })
  async streamFile(
    @GetUser() data: JwtTokenResponse,
    @Body() body: SyncTransactionDto,
  ) {
    this.logger.verbose('.streamFile', {
      username: data.username,
      fileId: body.filePath,
    });

    const fileEntity = await this.fileRepo.findFileForSync(body.filePath);

    if (!fileEntity) {
      throw new NotFoundException(`File with id ${body.filePath} not found`);
    }

    if (fileEntity instanceof Error) {
      throw new NotFoundException(`File with id ${body.filePath} not found`);
    }

    await this.fileRepo.updateStatusFile(
      fileEntity.fileId,
      FileStatusEnum.SYNC,
    );

    const fileBuffer = await this.fileService.getFileBuffer(
      this.fileService.getFileKey(fileEntity.filePath),
    );

    const ext = fileEntity.fileName.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      this.fileService.streamCSVAndSendKafka(fileBuffer, fileEntity.fileId);
    } else if (ext === 'xlsx') {
      this.fileService.streamXLSXAndSendKafka(fileBuffer, fileEntity.fileId);
    } else {
      throw new NotFoundException(`Unsupported file type: ${ext}`);
    }

    return { message: 'File streaming transaction please waiting' };
  }
}
