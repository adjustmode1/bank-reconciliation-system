import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { AuthService } from '../../../modules/auth/auth.service';
import { SexEnum } from '../enums/sex.enum';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthService,
  ) {}

  // Init user CMS
  async onApplicationBootstrap() {
    const env = process.env.NODE_ENV || 'development';
    if (env !== 'development' && env !== 'test') {
      this.logger.log(`Skipping user seed in environment: ${env}`);
      return;
    }

    const username = 'admin';
    const password = await this.authService.hashPassword('admin');

    const existing = await this.userRepository.findOne({ where: { username } });

    if (!existing) {
      const user = this.userRepository.create({
        username,
        password,
        name: 'admin',
        sex: SexEnum.MALE,
        code: 'ADMIN001',
        address: 'Headquarters',
        createAt: new Date(),
      });
      await this.userRepository.save(user);
      this.logger.log(`Init User "${username}" created successfully`);
    } else {
      this.logger.log(`Init User "${username}" already exists`);
    }
  }

  async createInitAccount(
    username: string,
    password: string,
    name: string,
    sex: SexEnum,
    code: string,
    address: string,
  ): Promise<UserEntity | Error> {
    try {
      this.logger.verbose('.createInitAccount', { username });

      const now = new Date();
      const user = this.userRepository.create({
        username,
        password,
        name,
        code,
        sex,
        address,
        createAt: now,
      });

      await this.userRepository.save(user);
      return user;
    } catch (e) {
      this.logger.error(e);
      return new Error('Database Occurs Exception');
    }
  }

  async getOneByUsername(username: string): Promise<UserEntity | null | Error> {
    try {
      this.logger.verbose('.getOneByUsername', { username });

      const user = await this.userRepository.findOne({
        where: { username },
      });

      return user || null;
    } catch (e) {
      this.logger.error(e);
      return new Error('Database Occurs Exception');
    }
  }
}
