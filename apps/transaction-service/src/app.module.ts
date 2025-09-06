import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import { CqrsModule } from '@nestjs/cqrs';
import { TransactionConsumerModule } from './modules/transaction-file/transaction-consumer.module';
import postgresqlConfig from './modules/store/config/postgresql.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllConfigType } from './config/config.type';
import { join } from 'path';
import { KafkaTopicInitializerService } from './kafka-topic-initializer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, postgresqlConfig],
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
    CqrsModule.forRoot(),
    TransactionConsumerModule,
  ],
  controllers: [],
  providers: [KafkaTopicInitializerService],
})
export class AppModule {}
