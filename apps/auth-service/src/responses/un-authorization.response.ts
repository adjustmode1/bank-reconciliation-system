import { ApiProperty } from '@nestjs/swagger';

export class UnAuthorizationResponse {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({
    example: 'Invalid token',
  })
  message: string[];

  @ApiProperty({ example: 'Unauthorized' })
  error: string;
}
