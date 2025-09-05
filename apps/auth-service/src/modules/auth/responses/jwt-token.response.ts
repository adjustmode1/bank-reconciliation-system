import { IsNotEmpty, IsString } from 'class-validator';

export class JwtTokenResponse {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
