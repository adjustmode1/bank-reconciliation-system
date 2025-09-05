import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SexEnum } from '../enums/sex.enum';

@Entity('user')
export class UserEntity extends BaseEntity {
  @PrimaryColumn({ length: 50 })
  username: string;

  @Column()
  password: string;

  @Column({ length: 50 })
  name: string;

  @Column({ enum: SexEnum, type: 'enum' })
  sex: SexEnum;

  @Column({ length: 20 })
  code: string;

  @Column({ length: 500 })
  address: string;
}
