import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity()
@Index(['propertyId'])
@Index(['tenantId'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column()
  transactionDate: Date;

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  propertyId: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Property, (property) => property.transactions)
  property: Property;

  @ManyToOne(() => Tenant, (tenant) => tenant.transactions)
  tenant: Tenant;
}
