import { Injectable, Logger } from '@nestjs/common';
import { Kafka, Admin } from 'kafkajs';

@Injectable()
export class KafkaTopicInitializerService {
  private readonly logger = new Logger(KafkaTopicInitializerService.name);
  private readonly kafka: Kafka;
  private readonly admin: Admin;
  private readonly topicsToEnsure: string[];

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID,
      brokers: [
        process.env.KAFKA_BROKERS_1 as string,
        process.env.KAFKA_BROKERS_2 as string,
        process.env.KAFKA_BROKERS_3 as string,
      ].filter(Boolean),
    });
    this.admin = this.kafka.admin();
    this.topicsToEnsure = [process.env.KAFKA_FILE_TRANSACTION_TOPIC as string].filter(Boolean);
  }

  // async onModuleInit() {
    // await this.createTopics();
  // }

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
      this.logger.log(`Created topics: ${topicsToCreate.map(t => t.topic).join(', ')}`);
    } else {
      this.logger.log('All topics already exist.');
    }

    await this.admin.disconnect();
  }
}
