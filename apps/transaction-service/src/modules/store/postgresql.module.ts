import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FileRepository } from './repositories/files.repository';
import { TransactionFileRepository } from './repositories/transaction-file.repository';
import { UserEntity } from './entities/user.entity';
import { TransactionFileEntity } from './entities/transaction-file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity, UserEntity, TransactionFileEntity]),
  ],
  providers: [FileRepository, TransactionFileRepository],
  exports: [FileRepository, TransactionFileRepository],
})
export class PostGreSQLModule {}
