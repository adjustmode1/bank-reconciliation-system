import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionFileEntity } from '../entities/transaction-file.entity';
import { TransactionTypeEnum } from '../enums/transaction-type.enum';

@Injectable()
export class TransactionFileRepository {
  private readonly logger = new Logger(TransactionFileRepository.name);
  constructor(
    @InjectRepository(TransactionFileEntity)
    private readonly repo: Repository<TransactionFileEntity>,
  ) {}

  async createTransaction(
    amount: number,
    content: string,
    type: TransactionTypeEnum,
    date: Date,
    fileId: string,
  ): Promise<TransactionFileEntity | Error> {
    try {
      this.logger.verbose('.createTransaction', {});

      const transaction = this.repo.create({
        amount,
        content,
        type,
        date,
        fileId,
      });

      return await this.repo.save(transaction);
    } catch (error) {
      this.logger.error('.createTransaction', (error as Error).message);
      return new Error('Database Occurs Exception');
    }
  }

  async countRecordTransactionByFile(fileId: string): Promise<number | Error> {
    try {
      this.logger.verbose('.createTransaction', {});

      return this.repo.countBy({
        fileId,
      });
    } catch (error) {
      this.logger.error('.createTransaction', (error as Error).message);
      return new Error('Database Occurs Exception');
    }
  }
}
