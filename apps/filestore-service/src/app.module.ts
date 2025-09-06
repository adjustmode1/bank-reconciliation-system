import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import { CqrsModule } from '@nestjs/cqrs';
import { FileModule } from './modules/file/file.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllConfigType } from './config/config.type';
import { join } from 'path';
import authConfig from './modules/auth/config/auth.config';
import fileConfig from './modules/file/config/file.config';
import redisConfig from './modules/cache/config/redis.config';
import postgresqlConfig from './modules/store/config/postgresql.config';
import { AuthModule } from './modules/auth/auth.module';
import { KafkaModule } from './modules/kafka/kafka.module';
import kafkaConfig from './modules/kafka/config/kafka.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        authConfig,
        fileConfig,
        redisConfig,
        postgresqlConfig,
        kafkaConfig,
      ],
      envFilePath: [`.env.${process.env.NODE_ENV}`],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('postgres.host', {
          infer: true,
        }),
        port: configService.getOrThrow<number>('postgres.port', {
          infer: true,
        }) as number,
        username: configService.getOrThrow<string>('postgres.username', {
          infer: true,
        }),
        password: configService.getOrThrow<string>('postgres.password', {
          infer: true,
        }),
        database: configService.getOrThrow<string>('postgres.dbName', {
          infer: true,
        }),
        entities: [
          join(__dirname, 'modules', 'store', 'entities', '*{.ts,.js}'),
        ],
        synchronize: true,
        maxQueryExecutionTime: 300,
        timezone: 'Z',
        logging: false,
        logger: 'file',
      }),
    }),
    AuthModule,
    KafkaModule,
    CqrsModule.forRoot(),
    FileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
