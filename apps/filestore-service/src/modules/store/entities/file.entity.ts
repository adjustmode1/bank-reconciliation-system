import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'files' })
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  fileId!: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ name: 'file_type', type: 'varchar', length: 100 })
  fileType!: string;

  @Column({ name: 'file_path', type: 'text' })
  filePath!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploaded_by', referencedColumnName: 'username' })
  user: UserEntity;

  @Column({ type: 'bigint' })
  size!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true})
  updatedAt?: Date;
}
