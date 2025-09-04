import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginHeaderDto {
  @ApiProperty({
    description: 'Device identity of user',
    example: '1:123456789012:web:a1b2c3d4e5f67890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  'x-device-id'!: string;
}
