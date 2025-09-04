import { ApiProperty } from '@nestjs/swagger';
import { RefreshTokenResponse } from './refresh-token.reponse';

export class LoginResponse {
  @ApiProperty({
    description: 'Refresh token data',
  })
  data!: RefreshTokenResponse;
}
