import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity()
@Index(['idempotencyKey'], { unique: true })
export class ImportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idempotencyKey: string;

  @Column()
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column('text', { nullable: true })
  errorMessage: string;

  @Column()
  tenantId: string;

  @Column()
  totalRecords: number;

  @Column()
  processedRecords: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
