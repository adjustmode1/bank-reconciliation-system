import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../../../config/config.type';
import { RefreshTokenCommand } from '../impl/refresh-token.command';
import { AuthService } from '../../auth.service';
import { RefreshTokenInformationResponse } from '../../responses/refresh-token-information.response';
import { UserRepository } from '../../../../modules/store/repositories/user.repository';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  private readonly logger = new Logger(RefreshTokenHandler.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly config: ConfigService<AllConfigType>,
  ) {}

  async execute(
    data: RefreshTokenCommand,
  ): Promise<RefreshTokenInformationResponse | Error> {
    this.logger.verbose('.execute');

    const driver = await this.userRepository.getOneByUsername(data.username);

    if (driver instanceof Error) {
      throw new HttpException(driver.message, HttpStatus.BAD_REQUEST);
    }

    if (!driver) {
      throw new HttpException('Accoount do not exists', HttpStatus.BAD_REQUEST);
    }

    const payload = {
      username: driver.username,
      deviceId: data.deviceId,
    };

    const accessToken =
      await this.authService.generateAccessTokenToken(payload);

    // TODO: insert refresh token to database
    return {
      accessToken,
      refreshToken: data.refreshToken,
    };
  }
}
