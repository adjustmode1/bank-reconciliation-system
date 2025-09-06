import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config/config.type';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { KafkaTopicInitializerService } from './modules/kafka/kafka-topic-initializer.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AllConfigType>);

  if (configService.getOrThrow<boolean>('kafka.isEnable', { infer: true })) {
    // create topic - kafka
    const topicInitializer = app.get(KafkaTopicInitializerService);
    await topicInitializer.createTopics();

    // microservices - kafka
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: configService.getOrThrow<string>('kafka.clientId', {
            infer: true,
          }),
          brokers: [
            configService.getOrThrow<string>('kafka.kafka1', { infer: true }),
            configService.getOrThrow<string>('kafka.kafka2', { infer: true }),
            configService.getOrThrow<string>('kafka.kafka3', { infer: true }),
          ],
        },
        consumer: {
          groupId: configService.getOrThrow<string>('kafka.groupId', {
            infer: true,
          }),
        },
        subscribe: { fromBeginning: true },
      },
    });
  }

  // set prefix for app
  const appPrefix = configService.getOrThrow('app.apiPrefix', {
    infer: true,
  });
  app.setGlobalPrefix(appPrefix, {
    exclude: ['/'],
  });

  // setup validation class validation
  app.useGlobalPipes(new ValidationPipe());

  // setup swagger module
  const port: number = configService.getOrThrow('app.port', {
    infer: true,
  });

  const swaggerEndpoint: string = configService.getOrThrow(
    'app.swaggerEndpoint',
    {
      infer: true,
    },
  );

  const options = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Auth API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${appPrefix}/${swaggerEndpoint}`, app, document);

  await app.listen(port);
  Logger.log(`Auth service started on port ${port}`, 'Main');
}
bootstrap();
