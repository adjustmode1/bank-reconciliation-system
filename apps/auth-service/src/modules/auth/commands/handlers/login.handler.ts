import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CacheService } from '../../../cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../../../config/config.type';
import { AuthService } from '../../auth.service';
import { LoginCommand } from '../impl/login.command';
import { UserRefreshTokenRepository } from '../../../store/repositories/user-refresh-token.repository';
import { RefreshTokenInformationResponse } from '../../responses/refresh-token-information.response';
import { UserRepository } from '../../../../modules/store/repositories/user.repository';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly logger = new Logger(LoginHandler.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly userRepo: UserRepository,
    private readonly authService: AuthService,
    private readonly userRefreshTokenRepo: UserRefreshTokenRepository,
    private readonly config: ConfigService<AllConfigType>,
  ) {}

  async execute(
    data: LoginCommand,
  ): Promise<RefreshTokenInformationResponse | Error> {
    this.logger.verbose('.execute', { username: data.username });
    const account = await this.userRepo.getOneByUsername(data.username);

    if (account instanceof Error) {
      throw new HttpException(account.message, HttpStatus.BAD_REQUEST);
    }

    if (!account) {
      throw new HttpException('Account do not exists', HttpStatus.BAD_REQUEST);
    }

    const isCorrectPassword = await this.authService.comparePassword(
      account.password,
      data.password,
    );

    if (!isCorrectPassword) {
      throw new HttpException(
        'Wrong username or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = {
      username: account.username,
      deviceId: data.deviceId,
    };

    const accessToken =
      await this.authService.generateAccessTokenToken(payload);
    const refreshToken = await this.authService.generateRefreshToken(payload);
    const ttl = await this.authService.getTTLJWTToken(refreshToken);

    const driverRefreshToken = await this.userRefreshTokenRepo.createFreshToken(
      data.username,
      data.deviceId,
      refreshToken,
      ttl,
    );

    if (driverRefreshToken instanceof Error) {
      throw new HttpException(
        driverRefreshToken.message,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}
