import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../config/config.type';

@Injectable()
export class CacheService extends Redis implements OnModuleDestroy {
  constructor(private readonly configService: ConfigService<AllConfigType>) {
    super({
      username: configService.getOrThrow('redis.username', { infer: true }),
      host: configService.getOrThrow('redis.host', { infer: true }),
      port: configService.getOrThrow('redis.port', { infer: true }),
      password: configService.getOrThrow('redis.password', { infer: true }),
    });
  }

  onModuleDestroy() {
    this.disconnect();
  }
}
