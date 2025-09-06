import { Column } from 'typeorm';

export class BaseEntity {
  @Column({ name: 'create_at' })
  createAt: Date;

  @Column({ name: 'update_at', nullable: true })
  updateAt?: Date;

  @Column({ name: 'delete_at', nullable: true })
  deleteAt?: Date;
}
