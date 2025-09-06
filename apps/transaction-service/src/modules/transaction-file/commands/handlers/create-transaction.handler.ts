import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTransactionCommand } from '../impl/create-transaction.commands';
import { TransactionFileRepository } from 'src/modules/store/repositories/transaction-file.repository';
import moment from 'moment';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
  implements ICommandHandler<CreateTransactionCommand>
{
  private readonly logger = new Logger(CreateTransactionHandler.name);

  constructor(
    private readonly transactionRepository: TransactionFileRepository,
  ) {}

  async execute(data: CreateTransactionCommand): Promise<void> {
    this.logger.verbose('.execute', {});

    const date = moment(data.date, 'DD/MM/YYYY HH:mm:ss').toDate();
    await this.transactionRepository.createTransaction(
      data.amount,
      data.content,
      data.type,
      date,
      data.fileId,
    );

    return;
  }
}
