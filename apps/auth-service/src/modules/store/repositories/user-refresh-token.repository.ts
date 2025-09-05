import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { UserRefreshTokenEntity } from '../entities/refresh-token.entity';

@Injectable()
export class UserRefreshTokenRepository {
  private readonly logger = new Logger(UserRefreshTokenRepository.name);

  constructor(
    @InjectRepository(UserRefreshTokenEntity)
    private readonly userRefreshTokenRepo: Repository<UserRefreshTokenEntity>,
  ) {}

  async createFreshToken(
    username: string,
    deviceId: string,
    token: string,
    expiresAt: Date,
  ): Promise<UserRefreshTokenEntity | Error> {
    try {
      this.logger.verbose('.createFreshToken', { deviceId, expiresAt });

      const now = new Date();
      const entity = this.userRefreshTokenRepo.create();

      entity.createAt = now;
      entity.username = username;
      entity.isRevoked = false;
      entity.deviceId = deviceId;
      entity.token = token;
      entity.expiresAt = expiresAt;

      await this.userRefreshTokenRepo.save(entity);

      return entity;
    } catch (e) {
      this.logger.error(e);
      return new Error('Database Occurs Exception');
    }
  }

  async deleteFreshToken(deviceId: string): Promise<boolean | Error> {
    try {
      this.logger.verbose('.deleteFreshToken', { deviceId });

      const deleteStatus = await this.userRefreshTokenRepo.delete({ deviceId });

      if (!deleteStatus) return false;

      return true;
    } catch (e) {
      this.logger.error(e);
      return new Error('Database Occurs Exception');
    }
  }

  async getRefreshToken(
    refreshToken: string,
  ): Promise<UserRefreshTokenEntity | null | Error> {
    try {
      this.logger.verbose('.getRefreshToken');

      const token = await this.userRefreshTokenRepo.findOne({
        where: {
          token: refreshToken,
          isRevoked: false,
          expiresAt: MoreThan(new Date()),
        },
      });
      if (!token) return null;

      return token;
    } catch (e) {
      this.logger.error(e);
      return new Error('Database Occurs Exception');
    }
  }
}
