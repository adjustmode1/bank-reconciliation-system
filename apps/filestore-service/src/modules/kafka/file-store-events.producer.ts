import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { TransactionRowDto } from '../file/dto/transaction-row.dto';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class FileStoreEventsProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FileStoreEventsProducer.name);

  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly transactionTopic: string;
  private readonly completedTransactionTopic: string;

  constructor(private readonly config: ConfigService<AllConfigType>) {
    this.kafka = new Kafka({
      clientId: config.getOrThrow<string>('kafka.clientId', { infer: true }),
      brokers: [
        config.getOrThrow<string>('kafka.kafka1', { infer: true }),
        config.getOrThrow<string>('kafka.kafka2', { infer: true }),
        config.getOrThrow<string>('kafka.kafka3', { infer: true }),
      ].filter(Boolean),
    });

    this.transactionTopic = config.getOrThrow<string>(
      'kafka.transactionTopic',
      { infer: true },
    );
    this.completedTransactionTopic = config.getOrThrow<string>(
      'kafka.completedTransactionTopic',
      { infer: true },
    );

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

  async sendMessage(
    message: TransactionRowDto & { fileId: string },
    key?: string,
  ): Promise<void> {
    const record: ProducerRecord = {
      topic: this.transactionTopic,
      messages: [{ key: key, value: JSON.stringify(message) }],
    };
    await this.producer.send(record);
    this.logger.log(`Message sent:  ${JSON.stringify(message)}`);
  }

  async sendCompletedMessage(
    message: { fileId: string; recordSize: number },
    key?: string,
  ): Promise<void> {
    const record: ProducerRecord = {
      topic: this.completedTransactionTopic,
      messages: [{ key: key, value: JSON.stringify(message) }],
    };
    await this.producer.send(record);
    this.logger.log(`Message sent:  ${JSON.stringify(message)}`);
  }
}
