import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { PropertyImportService } from './property-import.service';
import { Property } from '../entities/property.entity';
import { SqsService } from '../../sqs/sqs.service';

// Mock csv-parse
jest.mock('csv-parse/sync', () => ({
  parse: jest.fn(),
}));

describe('PropertyImportService', () => {
  let service: PropertyImportService;
  let propertyRepository: jest.Mocked<Repository<Property>>;
  let sqsService: jest.Mocked<SqsService>;
  let mockParse: jest.Mock;

  beforeEach(async () => {
    const mockRepository = {
      createQueryBuilder: jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orUpdate: jest.fn().mockReturnThis(),
        execute: jest.fn(),
      })),
    };

    const mockSqsService = {
      sendMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyImportService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockRepository,
        },
        {
          provide: SqsService,
          useValue: mockSqsService,
        },
      ],
    }).compile();

    service = module.get<PropertyImportService>(PropertyImportService);
    propertyRepository = module.get(getRepositoryToken(Property));
    sqsService = module.get(SqsService);

    // Get the mocked parse function
    mockParse = require('csv-parse/sync').parse;

    // Mock logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processImport', () => {
    it('should process CSV data and insert properties', async () => {
      const csvData = [
        {
          address: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          sector: 'Downtown',
          propertyType: 'House',
          longitude: -74.0060,
          latitude: 40.7128,
          valuation: 250000,
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1500,
          yearBuilt: 2020,
        },
      ];

      const fileBuffer = Buffer.from('csv,data');
      const tenantId = 'tenant-123';

      mockParse.mockReturnValue(csvData);

      const queryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orUpdate: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };

      propertyRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.processImport(fileBuffer, tenantId);

      expect(mockParse).toHaveBeenCalledWith(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        cast: expect.any(Function),
      });

      expect(queryBuilder.insert).toHaveBeenCalled();
      expect(queryBuilder.into).toHaveBeenCalledWith(Property);
      expect(queryBuilder.values).toHaveBeenCalledWith([
        {
          address: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          sector: 'Downtown',
          propertyType: 'House',
          longitude: -74.0060,
          latitude: 40.7128,
          valuation: 250000,
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1500,
          yearBuilt: 2020,
          tenantId,
        },
      ]);
      expect(queryBuilder.orUpdate).toHaveBeenCalledWith(
        ['valuation', 'bedrooms', 'bathrooms', 'squareFeet', 'yearBuilt'],
        ['address', 'tenantId'],
      );
      expect(queryBuilder.execute).toHaveBeenCalled();
    });

    it('should process large datasets in batches', async () => {
      const csvData = Array.from({ length: 1200 }, (_, i) => ({
        address: `${i} Main St`,
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        sector: 'Downtown',
        propertyType: 'House',
        longitude: -74.0060,
        latitude: 40.7128,
        valuation: 250000,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1500,
        yearBuilt: 2020,
      }));

      const fileBuffer = Buffer.from('csv,data');
      const tenantId = 'tenant-123';

      mockParse.mockReturnValue(csvData);

      const queryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orUpdate: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };

      propertyRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.processImport(fileBuffer, tenantId);

      // Should be called 3 times (1200 / 500 = 2.4, rounded up to 3)
      expect(queryBuilder.execute).toHaveBeenCalledTimes(3);
    });

    it('should handle foreign key violations gracefully', async () => {
      const csvData = [
        {
          address: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          sector: 'Downtown',
          propertyType: 'House',
          longitude: -74.0060,
          latitude: 40.7128,
          valuation: 250000,
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1500,
          yearBuilt: 2020,
        },
      ];

      const fileBuffer = Buffer.from('csv,data');
      const tenantId = 'non-existent-tenant';

      mockParse.mockReturnValue(csvData);

      const queryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orUpdate: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue({ code: '23503' }), // Foreign key violation
      };

      propertyRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.processImport(fileBuffer, tenantId);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Tenant ${tenantId} does not exist. Skipping batch.`,
      );
    });

    it('should rethrow non-foreign key errors', async () => {
      const csvData = [
        {
          address: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          sector: 'Downtown',
          propertyType: 'House',
          longitude: -74.0060,
          latitude: 40.7128,
          valuation: 250000,
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1500,
          yearBuilt: 2020,
        },
      ];

      const fileBuffer = Buffer.from('csv,data');
      const tenantId = 'tenant-123';

      mockParse.mockReturnValue(csvData);

      const queryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orUpdate: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      propertyRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await expect(service.processImport(fileBuffer, tenantId)).rejects.toThrow('Database error');
    });
  });

  describe('enqueueImportJob', () => {
    it('should send message to SQS when available', async () => {
      const fileBuffer = Buffer.from('csv,data');
      const tenantId = 'tenant-123';
      const idempotencyKey = 'unique-key';

      sqsService.sendMessage.mockResolvedValue(undefined);

      await service.enqueueImportJob(fileBuffer, tenantId, idempotencyKey);

      expect(sqsService.sendMessage).toHaveBeenCalledWith(
        {
          fileBuffer: fileBuffer.toString('base64'),
          tenantId,
          idempotencyKey,
        },
        'property-import',
        idempotencyKey,
      );
    });

    it('should process import directly when SQS is not available', async () => {
      const fileBuffer = Buffer.from('csv,data');
      const tenantId = 'tenant-123';
      const idempotencyKey = 'unique-key';

      sqsService.sendMessage.mockRejectedValue(new Error('SQS not available'));

      // Mock processImport method
      const processImportSpy = jest.spyOn(service, 'processImport').mockResolvedValue();

      await service.enqueueImportJob(fileBuffer, tenantId, idempotencyKey);

      expect(Logger.prototype.warn).toHaveBeenCalledWith('SQS not available, processing import directly');
      expect(processImportSpy).toHaveBeenCalledWith(fileBuffer, tenantId);

      processImportSpy.mockRestore();
    });
  });

  describe('CSV parsing cast function', () => {
    it('should correctly cast numeric values', async () => {
      const fileBuffer = Buffer.from('csv,data');
      const tenantId = 'tenant-123';

      // Mock the parse function to capture the cast function
      let castFunction: any;
      mockParse.mockImplementation((buffer, options) => {
        castFunction = options.cast;
        return [];
      });

      await service.processImport(fileBuffer, tenantId);

      // Test the cast function
      expect(castFunction('123.45', { header: false, column: 'longitude' })).toBe(123.45);
      expect(castFunction('100', { header: false, column: 'bedrooms' })).toBe(100);
      expect(castFunction('test', { header: false, column: 'address' })).toBe('test');
      expect(castFunction('header', { header: true, column: 'any' })).toBe('header');
    });
  });
});