import { CompletedTransactionHandler } from './completed-transaction.handler';
import { CreateTransactionHandler } from './create-transaction.handler';

export const TRANSACTION_FILE_COMMAND_HANDLERS = [
  CreateTransactionHandler,
  CompletedTransactionHandler,
];
