import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SyncTransactionDto {
  @ApiProperty({ example: 'abc123' })
  @IsString()
  @IsNotEmpty()
  filePath: string;
}
