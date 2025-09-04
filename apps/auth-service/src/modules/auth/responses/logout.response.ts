import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponse {
  @ApiProperty({
    description: 'Message of logout',
    example:
      'Init Register by phone number success, please verify otp to complete register account',
  })
  data!: string;
}
