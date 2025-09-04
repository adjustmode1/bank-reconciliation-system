import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserRefreshTokenEntity } from './entities/refresh-token.entity';
import { UserRefreshTokenRepository } from './repositories/user-refresh-token.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([UserEntity, UserRefreshTokenEntity]),
  ],
  providers: [UserRepository, UserRefreshTokenRepository],
  exports: [UserRepository, UserRefreshTokenRepository],
})
export class PostGreSQLModule {}
