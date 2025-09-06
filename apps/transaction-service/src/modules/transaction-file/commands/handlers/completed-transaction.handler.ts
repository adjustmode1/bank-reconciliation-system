import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TransactionFileRepository } from 'src/modules/store/repositories/transaction-file.repository';
import { CompletedTransactionCommand } from '../impl/completed-transaction-command';
import { FileRepository } from 'src/modules/store/repositories/files.repository';

@CommandHandler(CompletedTransactionCommand)
export class CompletedTransactionHandler
  implements ICommandHandler<CompletedTransactionCommand>
{
  private readonly logger = new Logger(CompletedTransactionHandler.name);

  constructor(
    private readonly transactionRepository: TransactionFileRepository,
    private readonly fileRepository: FileRepository,
  ) {}

  async execute(data: CompletedTransactionCommand): Promise<void> {
    this.logger.verbose('.execute', {
      fileId: data.fileId,
      size: data.recordSize,
    });

    const file = await this.fileRepository.getFileById(data.fileId);

    if (!file) {
      return;
    }

    if (file instanceof Error) {
      await this.fileRepository.updateStatusFalseSyncFile(
        data.fileId,
        file.message,
      );
      return;
    }

    const numberRecordSync =
      await this.transactionRepository.countRecordTransactionByFile(
        data.fileId,
      );

    if (numberRecordSync !== data.recordSize) {
      await this.fileRepository.updateStatusFalseSyncFile(
        data.fileId,
        'Data sync false',
      );
      return;
    }

    await this.fileRepository.updateStatusCompletedSyncFile(data.fileId);
    return;
  }
}
