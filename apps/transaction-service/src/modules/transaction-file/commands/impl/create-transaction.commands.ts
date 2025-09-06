import { TransactionTypeEnum } from 'src/modules/store/enums/transaction-type.enum';

export class CreateTransactionCommand {
  constructor(
    public readonly date: string,
    public readonly content: string,
    public readonly amount: number,
    public readonly type: TransactionTypeEnum,
    public readonly fileId: string,
  ) {}
}
