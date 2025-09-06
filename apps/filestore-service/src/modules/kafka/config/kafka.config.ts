import { registerAs } from '@nestjs/config';

import { IsBoolean, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { KafkaConfig } from './kafka.config.type';

class EnvironmentVariablesValidator {
  @IsBoolean()
  KAFKA_ENABLE!: boolean;

  @IsString()
  KAFKA_BROKERS_1: string;

  @IsString()
  KAFKA_BROKERS_2: string;

  @IsString()
  KAFKA_CLIENT_ID: string;

  @IsString()
  KAFKA_CONSUMER_GROUP_ID: string;

  @IsString()
  KAFKA_FILE_TRANSACTION_TOPIC: string;

  @IsString()
  KAFKA_FILE_TRANSACTION_COMPLETED_TOPIC: string;
}

export default registerAs<KafkaConfig>('kafka', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    isEnable: process.env.KAFKA_ENABLE
      ? process.env.KAFKA_ENABLE.toLocaleLowerCase() === 'true'
      : true,
    kafka1: process.env.KAFKA_BROKERS_1 ?? '127.0.0.1:9081',
    kafka2: process.env.KAFKA_BROKERS_1 ?? '127.0.0.1:9082',
    kafka3: process.env.KAFKA_BROKERS_1 ?? '127.0.0.1:9083',
    clientId: process.env.KAFKA_CLIENT_ID ?? 'bank-dev',
    groupId: process.env.KAFKA_CONSUMER_GROUP_ID ?? 'bank-dev-events',
    transactionTopic:
      process.env.KAFKA_FILE_TRANSACTION_TOPIC ?? 'file-transaction-topic',
    completedTransactionTopic:
      process.env.KAFKA_FILE_TRANSACTION_COMPLETED_TOPIC ??
      'file-transaction-completed-topic',
  };
});
