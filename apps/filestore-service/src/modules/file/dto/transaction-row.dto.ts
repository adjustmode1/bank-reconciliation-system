import { IsNotEmpty, IsString, IsNumber, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class TransactionRowDto {
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

  @IsNotEmpty()
  @IsString()
  type: 'Deposit' | 'Withdraw';
}
