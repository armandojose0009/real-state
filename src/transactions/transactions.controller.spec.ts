import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: jest.Mocked<TransactionsService>;

  const mockTransaction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    type: 'sale',
    amount: 250000,
    description: 'Property sale transaction',
    transactionDate: new Date(),
    propertyId: 'property-123',
    tenantId: 'tenant-123',
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const createDto: CreateTransactionDto = {
        type: 'sale',
        amount: 250000,
        description: 'Property sale transaction',
        transactionDate: new Date(),
        propertyId: 'property-123',
        tenantId: 'tenant-123',
      };
      const tenantId = 'tenant-123';

      service.create.mockResolvedValue(mockTransaction as any);

      const result = await controller.create(createDto, tenantId);

      expect(service.create).toHaveBeenCalledWith({ ...createDto, tenantId });
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions', async () => {
      const filterDto: TransactionFilterDto = {};
      const tenantId = 'tenant-123';
      const mockResponse = {
        data: [mockTransaction],
        pagination: { total: 1, totalPages: 1, currentPage: 1, limit: 10, hasNext: false, hasPrev: false, nextPage: null, prevPage: null },
      };

      service.findAll.mockResolvedValue(mockResponse as any);

      const result = await controller.findAll(filterDto, tenantId);

      expect(service.findAll).toHaveBeenCalledWith(filterDto, tenantId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      service.findOne.mockResolvedValue(mockTransaction as any);

      const result = await controller.findOne(id, tenantId);

      expect(service.findOne).toHaveBeenCalledWith(id, tenantId);
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateTransactionDto = { amount: 275000 };
      const tenantId = 'tenant-123';

      service.update.mockResolvedValue({ ...mockTransaction, amount: 275000 } as any);

      const result = await controller.update(id, updateDto, tenantId);

      expect(service.update).toHaveBeenCalledWith(id, updateDto, tenantId);
      expect(result.amount).toBe(275000);
    });
  });

  describe('remove', () => {
    it('should remove a transaction', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      service.remove.mockResolvedValue(undefined);

      await controller.remove(id, tenantId);

      expect(service.remove).toHaveBeenCalledWith(id, tenantId);
    });
  });
});