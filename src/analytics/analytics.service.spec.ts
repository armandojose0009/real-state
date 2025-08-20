import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from './analytics.service';
import { Property } from '../properties/entities/property.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let propertyRepository: jest.Mocked<Repository<Property>>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;

  beforeEach(async () => {
    const mockPropertyRepository = {
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      })),
    };

    const mockTransactionRepository = {
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockPropertyRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    propertyRepository = module.get(getRepositoryToken(Property));
    transactionRepository = module.get(getRepositoryToken(Transaction));
  });

  describe('getPropertyDistribution', () => {
    it('should return property distribution by sector and type', async () => {
      const tenantId = 'tenant-123';
      const mockDistribution = [
        { sector: 'Downtown', propertyType: 'House', count: '5' },
        { sector: 'Uptown', propertyType: 'Apartment', count: '3' },
      ];

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockDistribution),
      };

      propertyRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.getPropertyDistribution(tenantId);

      expect(propertyRepository.createQueryBuilder).toHaveBeenCalledWith('property');
      expect(queryBuilder.select).toHaveBeenCalledWith('property.sector, property.propertyType, COUNT(*) as count');
      expect(queryBuilder.where).toHaveBeenCalledWith('property.tenantId = :tenantId', { tenantId });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('property.deletedAt IS NULL');
      expect(queryBuilder.groupBy).toHaveBeenCalledWith('property.sector, property.propertyType');
      expect(result).toEqual(mockDistribution);
    });

    it('should handle empty results', async () => {
      const tenantId = 'tenant-123';
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      propertyRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.getPropertyDistribution(tenantId);

      expect(result).toEqual([]);
    });
  });

  describe('getMonthlyTrends', () => {
    it('should return monthly transaction trends', async () => {
      const tenantId = 'tenant-123';
      const mockTrends = [
        { month: '2024-01-01T00:00:00.000Z', avgAmount: '250000' },
        { month: '2024-02-01T00:00:00.000Z', avgAmount: '275000' },
      ];

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockTrends),
      };

      transactionRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.getMonthlyTrends(tenantId);

      expect(transactionRepository.createQueryBuilder).toHaveBeenCalledWith('transaction');
      expect(queryBuilder.select).toHaveBeenCalledWith(
        `DATE_TRUNC('month', transaction.transactionDate) as month, AVG(transaction.amount) as avgAmount`,
      );
      expect(queryBuilder.where).toHaveBeenCalledWith('transaction.tenantId = :tenantId', { tenantId });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('transaction.deletedAt IS NULL');
      expect(queryBuilder.groupBy).toHaveBeenCalledWith('month');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('month');
      expect(result).toEqual(mockTrends);
    });

    it('should handle empty trends', async () => {
      const tenantId = 'tenant-123';
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      transactionRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.getMonthlyTrends(tenantId);

      expect(result).toEqual([]);
    });
  });

  describe('getValuationGrowth', () => {
    it('should return valuation growth by sector and year', async () => {
      const tenantId = 'tenant-123';
      const mockGrowth = [
        { sector: 'Downtown', year: 2023, avgValuation: '240000' },
        { sector: 'Downtown', year: 2024, avgValuation: '260000' },
        { sector: 'Uptown', year: 2023, avgValuation: '180000' },
        { sector: 'Uptown', year: 2024, avgValuation: '195000' },
      ];

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockGrowth),
      };

      propertyRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.getValuationGrowth(tenantId);

      expect(propertyRepository.createQueryBuilder).toHaveBeenCalledWith('property');
      expect(queryBuilder.select).toHaveBeenCalledWith(
        `property.sector, 
               EXTRACT(YEAR FROM property.createdAt) as year,
               AVG(property.valuation) as avgValuation`,
      );
      expect(queryBuilder.where).toHaveBeenCalledWith('property.tenantId = :tenantId', { tenantId });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('property.deletedAt IS NULL');
      expect(queryBuilder.groupBy).toHaveBeenCalledWith('property.sector, year');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('property.sector, year');
      expect(result).toEqual(mockGrowth);
    });

    it('should handle empty growth data', async () => {
      const tenantId = 'tenant-123';
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      propertyRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.getValuationGrowth(tenantId);

      expect(result).toEqual([]);
    });
  });
});