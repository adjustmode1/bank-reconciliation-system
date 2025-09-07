import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { FileEntity } from './file.entity';
import { TransactionTypeEnum } from '../enums/transaction-type.enum';

@Entity({ name: 'transaction_files' })
export class TransactionFileEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'transaction_file_id' })
  transactionFileId!: string;

  @Column('decimal', { precision: 18, scale: 2 })
  amount!: number;

  @Column('text')
  content!: string;

  @Column({ type: 'enum', enum: TransactionTypeEnum })
  type!: TransactionTypeEnum;

  @Column({ type: 'timestamp' })
  date!: Date;

  @Index()
  @Column({ type: 'uuid', name: 'file_id' })
  fileId!: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
