import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: jest.Mocked<AnalyticsService>;

  beforeEach(async () => {
    const mockService = {
      getPropertyDistribution: jest.fn(),
      getMonthlyTrends: jest.fn(),
      getValuationGrowth: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get(AnalyticsService);
  });

  describe('getPropertyDistribution', () => {
    it('should return property distribution', async () => {
      const tenantId = 'tenant-123';
      const mockData = [{ sector: 'Downtown', propertyType: 'House', count: '5' }];
      
      service.getPropertyDistribution.mockResolvedValue(mockData);

      const result = await controller.getPropertyDistribution(tenantId);

      expect(service.getPropertyDistribution).toHaveBeenCalledWith(tenantId);
      expect(result).toEqual(mockData);
    });
  });

  describe('getMonthlyTrends', () => {
    it('should return monthly trends', async () => {
      const tenantId = 'tenant-123';
      const mockData = [{ month: '2024-01-01', avgAmount: '250000' }];
      
      service.getMonthlyTrends.mockResolvedValue(mockData);

      const result = await controller.getMonthlyTrends(tenantId);

      expect(service.getMonthlyTrends).toHaveBeenCalledWith(tenantId);
      expect(result).toEqual(mockData);
    });
  });

  describe('getValuationGrowth', () => {
    it('should return valuation growth', async () => {
      const tenantId = 'tenant-123';
      const mockData = [{ sector: 'Downtown', year: 2024, avgValuation: '260000' }];
      
      service.getValuationGrowth.mockResolvedValue(mockData);

      const result = await controller.getValuationGrowth(tenantId);

      expect(service.getValuationGrowth).toHaveBeenCalledWith(tenantId);
      expect(result).toEqual(mockData);
    });
  });
});