import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { UserRole } from '../../auth/enums/user-role.enum';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Property, (property) => property.tenant)
  properties: Property[];

  @OneToMany(() => Listing, (listing) => listing.tenant)
  listings: Listing[];

  @OneToMany(() => Transaction, (transaction) => transaction.tenant)
  transactions: Transaction[];
}
