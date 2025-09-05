import { Module } from '@nestjs/common';
import { KafkaTopicInitializerService } from './kafka-topic-initializer.service';
import { FileStoreEventsProducer } from './file-store-events.producer';

@Module({
  providers: [KafkaTopicInitializerService, FileStoreEventsProducer],
  exports: [KafkaTopicInitializerService, FileStoreEventsProducer],
})
export class KafkaModule {}
