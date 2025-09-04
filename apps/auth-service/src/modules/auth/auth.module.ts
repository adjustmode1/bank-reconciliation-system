import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AUTH_COMMAND_HANDLERS } from './commands/handlers';
import { CacheModule } from '../cache/cache.module';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { PostGreSQLModule } from '../store/postgresql.module';

@Module({
  imports: [
    JwtModule.register({}),
    CacheModule,
    forwardRef(() => PostGreSQLModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    ...AUTH_COMMAND_HANDLERS,
  ],
  exports: [JwtStrategy, JwtRefreshStrategy, AuthService],
})
export class AuthModule {}
