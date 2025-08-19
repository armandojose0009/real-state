import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Listing } from '../../listings/entities/listing.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Point } from 'geojson';

@Entity()
@Index(['tenantId'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zipCode: string;

  @Column()
  sector: string;

  @Column()
  propertyType: string;

  @Column('geometry', { spatialFeatureType: 'Point', srid: 4326 })
  location: Point;

  @Column('decimal', { precision: 12, scale: 2 })
  valuation: number;

  @Column()
  bedrooms: number;

  @Column()
  bathrooms: number;

  @Column()
  squareFeet: number;

  @Column()
  yearBuilt: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.properties)
  tenant: Tenant;

  @OneToMany(() => Listing, (listing) => listing.property)
  listings: Listing[];

  @OneToMany(() => Transaction, (transaction) => transaction.property)
  transactions: Transaction[];
}
