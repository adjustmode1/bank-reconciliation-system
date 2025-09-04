import { ApiProperty } from '@nestjs/swagger';
import { RefreshTokenInformationResponse } from './refresh-token-information.response';

export class RefreshTokenResponse {
  @ApiProperty({
    description: 'Refresh token data',
  })
  data!: RefreshTokenInformationResponse;
}
