import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    example: ['property must be a string'],
    isArray: true,
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
