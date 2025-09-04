import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ValidationErrorResponse } from 'src/responses/validation-error.response';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './responses/login.response';
import { LoginHeaderDto } from './dto/login-header.dto';
import { ValidatedHeaders } from './decorators/validate-header.decorator';
import { LoginCommand } from './commands/impl/login.command';
import { RefreshTokenResponse } from './responses/refresh-token.reponse';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { UnAuthorizationResponse } from 'src/responses/responses/un-authorization.response';
import { LogoutResponse } from './responses/logout.response';
import { JwtTokenResponse } from './responses/jwt-token.response';
import { GetUser } from './decorators/get-user-info.decorator';
import { LogoutCommand } from './commands/impl/logout.command';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenInformationResponse } from './responses/refresh-token-information.response';
import { RefreshTokenCommand } from './commands/impl/refresh-token.command';
import { ReGenerateRefreshTokenResponse } from './responses/re-generate-refresh-token.response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @ApiOperation({ summary: 'Login to app' })
  @ApiBody({ type: LoginDto })
  @ApiHeader({
    name: 'x-device-id',
    required: true,
    description: 'Unique device ID',
    example: '1:123456789012:IOS:a1b2c3d4e5f67890abcdef',
  })
  @ApiOkResponse({ description: 'Login successfully', type: LoginResponse })
  @ApiBadRequestResponse({ type: ValidationErrorResponse })
  async login(
    @ValidatedHeaders(LoginHeaderDto) headers: LoginHeaderDto,
    @Body() data: LoginDto,
  ): Promise<LoginResponse> {
    this.logger.verbose('.login', { username: data.username });

    const token = await this.commandBus.execute<
      LoginCommand,
      RefreshTokenResponse
    >(new LoginCommand(data.username, data.password, headers['x-device-id']));

    return {
      data: token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from app' })
  @ApiOkResponse({ description: 'Logout successfully', type: LogoutResponse })
  @ApiUnauthorizedResponse({ type: UnAuthorizationResponse })
  async logout(@GetUser() data: JwtTokenResponse): Promise<LogoutResponse> {
    this.logger.verbose('.logout', { deviceId: data.deviceId });

    const messageResult = await this.commandBus.execute<LogoutCommand, string>(
      new LogoutCommand(data.deviceId),
    );

    return {
      data: messageResult,
    };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh-token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate refresh token' })
  @ApiOkResponse({
    description: 'Logout successfully',
    type: ReGenerateRefreshTokenResponse,
  })
  async refreshToken(
    @GetUser() data: JwtTokenResponse,
  ): Promise<ReGenerateRefreshTokenResponse> {
    this.logger.verbose('.refreshToken');

    const messageResult = await this.commandBus.execute<
      RefreshTokenCommand,
      RefreshTokenInformationResponse
    >(new RefreshTokenCommand(data.username, data.driverId, data.refreshToken));

    return {
      data: messageResult,
    };
  }
}
