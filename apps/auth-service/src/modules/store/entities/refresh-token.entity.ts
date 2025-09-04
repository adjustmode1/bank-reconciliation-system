import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('user_refresh_token')
export class UserRefreshTokenEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  userRefreshTokenId!: number;

  @Column({ name: 'user_id' })
  username!: string;

  @Column()
  token!: string;

  @Column({ name: 'device_id' })
  deviceId!: string;

  @Column({ name: 'expires_at' })
  expiresAt!: Date;

  @Column()
  isRevoked!: boolean;

  @ManyToOne(() => UserEntity, (user) => user.username, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'username' })
  user: UserEntity;
}
