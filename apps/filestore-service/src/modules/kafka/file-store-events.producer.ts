import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import * as process from 'node:process';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class FileStoreEventsProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FileStoreEventsProducer.name);

  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly topic: string = process.env.KAFKA_FILE_TRANSACTION_TOPIC as string;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID,
      brokers: [
        process.env.KAFKA_BROKERS_1 as string,
        process.env.KAFKA_BROKERS_2 as string,
        process.env.KAFKA_BROKERS_3 as string,
      ].filter(Boolean),
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Producer connected...');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Producer disconnected.');
  }

  async sendMessage(message: any, key?: string, topic: string = this.topic): Promise<void> {
    const record: ProducerRecord = {
      topic,
      messages: [{ key: key, value: JSON.stringify(message) }],
    };
    await this.producer.send(record);
    this.logger.log(`Message sent '${key}':  ${JSON.stringify(message)}`);
  }
}
