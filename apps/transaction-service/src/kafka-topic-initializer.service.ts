import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Admin } from 'kafkajs';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class KafkaTopicInitializerService {
  private readonly logger = new Logger(KafkaTopicInitializerService.name);
  private readonly kafka: Kafka;
  private readonly admin: Admin;
  private readonly topicsToEnsure: string[];

  constructor(private readonly config: ConfigService<AllConfigType>) {
    this.kafka = new Kafka({
      clientId: config.getOrThrow<string>('app.clientId', { infer: true }),
      brokers: [
        config.getOrThrow<string>('app.kafka1', { infer: true }),
        config.getOrThrow<string>('app.kafka2', { infer: true }),
        config.getOrThrow<string>('app.kafka3', { infer: true }),
      ].filter(Boolean),
    });
    this.admin = this.kafka.admin();
    this.topicsToEnsure = [
      config.getOrThrow<string>('app.transactionTopic', { infer: true }),
      config.getOrThrow<string>('app.completedTransactionTopic', {
        infer: true,
      }),
    ].filter(Boolean);
  }

  async createTopics() {
    await this.admin.connect();

    const existingTopics = await this.admin.listTopics();
    const topicsToCreate = this.topicsToEnsure
      .filter((topic) => !existingTopics.includes(topic))
      .map((topic) => ({
        topic,
        numPartitions: 3,
        replicationFactor: 3,
      }));

    if (topicsToCreate.length > 0) {
      await this.admin.createTopics({
        topics: topicsToCreate,
        waitForLeaders: true,
      });
      this.logger.log(
        `Created topics: ${topicsToCreate.map((t) => t.topic).join(', ')}`,
      );
    } else {
      this.logger.log('All topics already exist.');
    }

    await this.admin.disconnect();
  }
}
