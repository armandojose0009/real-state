import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
@Index(['year', 'month', 'sector'])
export class PropertyAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column()
  sector: string;

  @Column()
  propertyType: string;

  @Column('decimal', { precision: 12, scale: 2 })
  medianPrice: number;

  @Column('decimal', { precision: 12, scale: 2 })
  averagePrice: number;

  @Column('decimal', { precision: 12, scale: 2 })
  minPrice: number;

  @Column('decimal', { precision: 12, scale: 2 })
  maxPrice: number;

  @Column()
  transactionCount: number;
}
