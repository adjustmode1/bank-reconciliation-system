import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: 'Password of user, used for login',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
