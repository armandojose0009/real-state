import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: jest.Mocked<Repository<Transaction>>;

  const mockTransaction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    type: 'sale',
    amount: 250000,
    description: 'Property sale transaction',
    transactionDate: new Date(),
    propertyId: 'property-123',
    tenantId: 'tenant-123',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    property: {
      id: 'property-123',
      address: '123 Main St',
    },
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get(getRepositoryToken(Transaction));
  });

  describe('create', () => {
    it('should create a transaction successfully', async () => {
      const createDto: CreateTransactionDto = {
        type: 'sale',
        amount: 250000,
        description: 'Property sale transaction',
        transactionDate: new Date(),
        propertyId: 'property-123',
        tenantId: 'tenant-123',
      };

      repository.create.mockReturnValue(mockTransaction as any);
      repository.save.mockResolvedValue(mockTransaction as any);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockTransaction);
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions with default filters', async () => {
      const filterDto: TransactionFilterDto = {};
      const tenantId = 'tenant-123';
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAll(filterDto, tenantId);

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('transaction.property', 'property');
      expect(queryBuilder.where).toHaveBeenCalledWith('transaction.tenantId = :tenantId', { tenantId });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('transaction.deletedAt IS NULL');
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(result.data).toEqual([mockTransaction]);
    });

    it('should apply all filters correctly', async () => {
      const filterDto: TransactionFilterDto = {
        type: 'sale',
        minAmount: 200000,
        maxAmount: 300000,
        search: 'Property',
        sort: 'amount',
        order: 'DESC',
        limit: 5,
        offset: 10,
      };
      const tenantId = 'tenant-123';
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(filterDto, tenantId);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('transaction.type = :type', { type: 'sale' });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('transaction.amount BETWEEN :minAmount AND :maxAmount', {
        minAmount: 200000,
        maxAmount: 300000,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('transaction.description ILIKE :search', { search: '%Property%' });
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('transaction.amount', 'DESC');
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    });

    it('should handle amount filters with only minAmount', async () => {
      const filterDto: TransactionFilterDto = { minAmount: 200000 };
      const tenantId = 'tenant-123';
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(filterDto, tenantId);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('transaction.amount BETWEEN :minAmount AND :maxAmount', {
        minAmount: 200000,
        maxAmount: Number.MAX_SAFE_INTEGER,
      });
    });

    it('should handle amount filters with only maxAmount', async () => {
      const filterDto: TransactionFilterDto = { maxAmount: 300000 };
      const tenantId = 'tenant-123';
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(filterDto, tenantId);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('transaction.amount BETWEEN :minAmount AND :maxAmount', {
        minAmount: 0,
        maxAmount: 300000,
      });
    });
  });

  describe('findOne', () => {
    it('should return transaction when found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(mockTransaction as any);

      const result = await service.findOne(id, tenantId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id, tenantId, deletedAt: expect.any(Object) },
        relations: ['property'],
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      const id = 'non-existent';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id, tenantId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update transaction successfully', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';
      const updateDto: UpdateTransactionDto = { amount: 275000 };
      const updatedTransaction = { ...mockTransaction, amount: 275000 };

      repository.findOne.mockResolvedValue(mockTransaction as any);
      repository.save.mockResolvedValue(updatedTransaction as any);

      const result = await service.update(id, updateDto, tenantId);

      expect(repository.save).toHaveBeenCalled();
      expect(result.amount).toBe(275000);
    });

    it('should throw NotFoundException when transaction not found for update', async () => {
      const id = 'non-existent';
      const tenantId = 'tenant-123';
      const updateDto: UpdateTransactionDto = { amount: 275000 };

      repository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateDto, tenantId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete transaction', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(mockTransaction as any);
      repository.save.mockResolvedValue({ ...mockTransaction, deletedAt: new Date() } as any);

      await service.remove(id, tenantId);

      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when transaction not found for removal', async () => {
      const id = 'non-existent';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(id, tenantId)).rejects.toThrow(NotFoundException);
    });
  });
});