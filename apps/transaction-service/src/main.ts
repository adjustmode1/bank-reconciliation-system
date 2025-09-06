import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config/config.type';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KafkaTopicInitializerService } from './kafka-topic-initializer.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService<AllConfigType>);

  const clientId = configService.getOrThrow<string>('app.clientId', {
    infer: true,
  });
  const brokers = [
    configService.getOrThrow<string>('app.kafka1', { infer: true }),
    configService.getOrThrow<string>('app.kafka2', { infer: true }),
    configService.getOrThrow<string>('app.kafka3', { infer: true }),
  ];
  const groupId = configService.getOrThrow<string>('app.groupId', {
    infer: true,
  });

  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId,
          brokers,
        },
        consumer: {
          groupId,
        },
        subscribe: { fromBeginning: true },
      },
    },
  );

  const topicInitializer = kafkaApp.get(KafkaTopicInitializerService);
  await topicInitializer.createTopics();

  await kafkaApp.listen();

  Logger.log(`Transaction service service started`, 'Main');
}
bootstrap();
