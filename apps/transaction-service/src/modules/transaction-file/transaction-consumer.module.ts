import { Module } from '@nestjs/common';
import { TransactionConsumerController } from './transaction-consumer.controller';
import { TRANSACTION_FILE_COMMAND_HANDLERS } from './commands/handlers';
import { PostGreSQLModule } from '../store/postgresql.module';

@Module({
  imports: [PostGreSQLModule],
  controllers: [TransactionConsumerController],
  providers: [...TRANSACTION_FILE_COMMAND_HANDLERS],
  exports: [],
})
export class TransactionConsumerModule {}
