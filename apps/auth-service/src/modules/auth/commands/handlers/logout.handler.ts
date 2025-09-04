import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { LogoutCommand } from '../impl/logout.command';
import { UserRefreshTokenRepository } from '../../../store/repositories/user-refresh-token.repository';
import { AuthService } from '../../auth.service';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  private readonly logger = new Logger(LogoutHandler.name);
  constructor(
    private readonly userRefreshRepository: UserRefreshTokenRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(data: LogoutCommand): Promise<boolean | Error> {
    this.logger.verbose('.execute', { deviceId: data.deviceId });

    const deleteStatus = await this.userRefreshRepository.deleteFreshToken(
      data.deviceId,
    );

    if (deleteStatus instanceof Error) {
      throw new HttpException(deleteStatus.message, HttpStatus.UNAUTHORIZED);
    }

    // TODO: add blacked list refresh token and access token
    return true;
  }
}
