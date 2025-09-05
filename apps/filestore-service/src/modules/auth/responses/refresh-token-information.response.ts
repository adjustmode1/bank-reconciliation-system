import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenInformationResponse {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
