import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../properties/entities/property.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getPropertyDistribution(tenantId: string) {
    return this.propertyRepository
      .createQueryBuilder('property')
      .select('property.sector, property.propertyType, COUNT(*) as count')
      .where('property.tenantId = :tenantId', { tenantId })
      .andWhere('property.deletedAt IS NULL')
      .groupBy('property.sector, property.propertyType')
      .getRawMany();
  }

  async getMonthlyTrends(tenantId: string) {
    return this.transactionRepository
      .createQueryBuilder('transaction')
      .select(
        `DATE_TRUNC('month', transaction.transactionDate) as month, AVG(transaction.amount) as avgAmount`,
      )
      .where('transaction.tenantId = :tenantId', { tenantId })
      .andWhere('transaction.deletedAt IS NULL')
      .groupBy('month')
      .orderBy('month')
      .getRawMany();
  }

  async getValuationGrowth(tenantId: string) {
    return this.propertyRepository
      .createQueryBuilder('property')
      .select(
        `property.sector, 
               EXTRACT(YEAR FROM property.createdAt) as year,
               AVG(property.valuation) as avgValuation`,
      )
      .where('property.tenantId = :tenantId', { tenantId })
      .andWhere('property.deletedAt IS NULL')
      .groupBy('property.sector, year')
      .orderBy('property.sector, year')
      .getRawMany();
  }
}
