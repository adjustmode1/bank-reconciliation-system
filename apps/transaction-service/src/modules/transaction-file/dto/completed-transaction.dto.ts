import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CompltedTransactionDto {
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @IsNumber()
  recordSize: number;
}
