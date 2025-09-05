import {
  Controller,
  Get,
  Logger,
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

@ApiTags('File')
@Controller('file')
export class FileController {
  private readonly logger = new Logger(FileController.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly producer: FileStoreEventsProducer
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
    @UploadedFile() file: Express.MulterS3.File,
  ): Promise<UploadFileResponse> {
    this.logger.verbose('.uploadFile', { username: data.username });

    const filePath = await this.commandBus.execute<UploadFileCommand, string>(
      new UploadFileCommand(file, data.username),
    );

    return {
      data: filePath,
    };
  }

  @Get('hello')
  async getHello(): Promise<void> {

    // Gửi sự kiện
    await this.producer.sendMessage('ffffff', 'hello-key');
    return;
  }
}
