import { Test, TestingModule } from '@nestjs/testing';
import { PropertyImportController } from './property-import.controller';
import { PropertyImportService } from './property-import.service';

describe('PropertyImportController', () => {
  let controller: PropertyImportController;
  let service: jest.Mocked<PropertyImportService>;

  beforeEach(async () => {
    const mockService = {
      enqueueImportJob: jest.fn(),
      processImport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyImportController],
      providers: [
        {
          provide: PropertyImportService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PropertyImportController>(PropertyImportController);
    service = module.get(PropertyImportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importProperties', () => {
    it('should handle file import', async () => {
      const mockFile = {
        buffer: Buffer.from('csv,data'),
        originalname: 'test.csv',
        mimetype: 'text/csv',
      } as Express.Multer.File;
      const idempotencyKeyDto = { idempotencyKey: 'unique-key' };
      const tenantId = 'tenant-123';

      service.enqueueImportJob.mockResolvedValue(undefined);

      const result = await controller.importProperties(mockFile, idempotencyKeyDto, tenantId);

      expect(service.enqueueImportJob).toHaveBeenCalledWith(
        mockFile.buffer,
        tenantId,
        'unique-key',
      );
      expect(result).toEqual({
        message: 'Import job accepted',
        idempotencyKey: 'unique-key',
      });
    });
  });
});