import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadTransactionDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({ example: 'abc123' })
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
