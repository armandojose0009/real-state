import { Test, TestingModule } from '@nestjs/testing';
import { PropertyImportProcessor } from './property-import.processor';
import { PropertyImportService } from './property-import.service';

describe('PropertyImportProcessor', () => {
  let processor: PropertyImportProcessor;
  let service: jest.Mocked<PropertyImportService>;

  beforeEach(async () => {
    const mockService = {
      processImport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyImportProcessor,
        {
          provide: PropertyImportService,
          useValue: mockService,
        },
      ],
    }).compile();

    processor = module.get<PropertyImportProcessor>(PropertyImportProcessor);
    service = module.get(PropertyImportService);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handleImport', () => {
    it('should process import job', async () => {
      const mockJob = {
        data: {
          fileBuffer: Buffer.from('csv,data').toString('base64'),
          tenantId: 'tenant-123',
          idempotencyKey: 'unique-key',
        },
      };

      service.processImport.mockResolvedValue(undefined);

      await processor.handleImport(mockJob as any);

      expect(service.processImport).toHaveBeenCalledWith(
        Buffer.from(mockJob.data.fileBuffer, 'base64'),
        mockJob.data.tenantId,
      );
    });
  });
});