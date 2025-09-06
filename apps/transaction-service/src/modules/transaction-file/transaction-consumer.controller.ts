import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTransactionCommand } from './commands/impl/create-transaction.commands';
import { CompltedTransactionDto } from './dto/completed-transaction.dto';
import { CompletedTransactionCommand } from './commands/impl/completed-transaction-command';
// import { CreateTransactionCommand } from './commands/create-transaction.command';

@Controller()
export class TransactionConsumerController {
  private readonly logger = new Logger(TransactionConsumerController.name);
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('file-transaction-topic')
  async handleTransaction(@Payload() message: CreateTransactionDto) {
    this.logger.verbose(
      'Received Kafka message from topic: file-transaction-topic',
      { data: message },
    );

    try {
      const dto = plainToInstance(CreateTransactionDto, message);

      const errors = await validate(dto);
      if (errors.length > 0) {
        this.logger.error(`Bad request: ${JSON.stringify(errors, null, 2)}`);

        return;
      }

      await this.commandBus.execute(
        new CreateTransactionCommand(
          dto.date,
          dto.content,
          dto.amount,
          dto.type,
          dto.fileId,
        ),
      );

      return;
    } catch (error) {
      this.logger.error(
        `Exception khi validate Kafka message: ${(error as Error).message}`,
      );
      throw new BadRequestException((error as Error).message);
    }
  }

  @MessagePattern('file-transaction-completed-topic')
  async handleCompleteTransaction(@Payload() message: CompltedTransactionDto) {
    this.logger.verbose(
      'Received Kafka message from topic: file-transaction-completed-topic',
      { data: message },
    );

    try {
      const dto = plainToInstance(CompltedTransactionDto, message);

      const errors = await validate(dto);
      if (errors.length > 0) {
        this.logger.error(`Bad request: ${JSON.stringify(errors, null, 2)}`);

        return;
      }

      await this.commandBus.execute(
        new CompletedTransactionCommand(dto.fileId, dto.recordSize),
      );

      return;
    } catch (error) {
      this.logger.error(
        `Exception khi validate Kafka message: ${(error as Error).message}`,
      );
      throw new BadRequestException((error as Error).message);
    }
  }
}
