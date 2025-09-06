import {
  IsEnum,
  IsNumber,
  IsString,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TransactionTypeEnum } from 'src/modules/store/enums/transaction-type.enum';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/, {
    message: 'date must be in format dd/MM/yyyy HH:mm:ss',
  })
  date: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber({}, { message: 'amount must be a number' })
  amount: number;

  @IsEnum(TransactionTypeEnum)
  type: TransactionTypeEnum;

  @IsString()
  @IsNotEmpty()
  fileId: string;
}
