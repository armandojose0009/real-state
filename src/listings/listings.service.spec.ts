import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { Listing } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingFilterDto } from './dto/listing-filter.dto';

describe('ListingsService', () => {
  let service: ListingsService;
  let repository: jest.Mocked<Repository<Listing>>;

  const mockListing = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Beautiful House',
    description: 'A beautiful house in downtown',
    price: 250000,
    status: 'active',
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
        ListingsService,
        {
          provide: getRepositoryToken(Listing),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    repository = module.get(getRepositoryToken(Listing));
  });

  describe('create', () => {
    it('should create a listing successfully', async () => {
      const createDto: CreateListingDto = {
        title: 'Beautiful House',
        description: 'A beautiful house in downtown',
        price: 250000,
        status: 'active',
        propertyId: 'property-123',
        tenantId: 'tenant-123',
      };

      repository.create.mockReturnValue(mockListing as any);
      repository.save.mockResolvedValue(mockListing as any);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockListing);
      expect(result).toEqual(mockListing);
    });
  });

  describe('findAll', () => {
    it('should return paginated listings with default filters', async () => {
      const filterDto: ListingFilterDto = {};
      const tenantId = 'tenant-123';
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockListing], 1]),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAll(filterDto, tenantId);

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('listing.property', 'property');
      expect(queryBuilder.where).toHaveBeenCalledWith('listing.tenantId = :tenantId', { tenantId });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('listing.deletedAt IS NULL');
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(result.data).toEqual([mockListing]);
    });

    it('should apply all filters correctly', async () => {
      const filterDto: ListingFilterDto = {
        status: 'active',
        minPrice: 200000,
        maxPrice: 300000,
        search: 'Beautiful',
        sort: 'price',
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
        getManyAndCount: jest.fn().mockResolvedValue([[mockListing], 1]),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(filterDto, tenantId);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('listing.status = :status', { status: 'active' });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('listing.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: 200000,
        maxPrice: 300000,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('listing.title ILIKE :search', { search: '%Beautiful%' });
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('listing.price', 'DESC');
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    });

    it('should handle price filters with only minPrice', async () => {
      const filterDto: ListingFilterDto = { minPrice: 200000 };
      const tenantId = 'tenant-123';
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockListing], 1]),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(filterDto, tenantId);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('listing.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: 200000,
        maxPrice: Number.MAX_SAFE_INTEGER,
      });
    });

    it('should handle price filters with only maxPrice', async () => {
      const filterDto: ListingFilterDto = { maxPrice: 300000 };
      const tenantId = 'tenant-123';
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockListing], 1]),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(filterDto, tenantId);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('listing.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: 0,
        maxPrice: 300000,
      });
    });
  });

  describe('findOne', () => {
    it('should return listing when found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(mockListing as any);

      const result = await service.findOne(id, tenantId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id, tenantId, deletedAt: expect.any(Object) },
        relations: ['property'],
      });
      expect(result).toEqual(mockListing);
    });

    it('should throw NotFoundException when listing not found', async () => {
      const id = 'non-existent';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id, tenantId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update listing successfully', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';
      const updateDto: UpdateListingDto = { price: 275000 };
      const updatedListing = { ...mockListing, price: 275000 };

      repository.findOne.mockResolvedValue(mockListing as any);
      repository.save.mockResolvedValue(updatedListing as any);

      const result = await service.update(id, updateDto, tenantId);

      expect(repository.save).toHaveBeenCalled();
      expect(result.price).toBe(275000);
    });

    it('should throw NotFoundException when listing not found for update', async () => {
      const id = 'non-existent';
      const tenantId = 'tenant-123';
      const updateDto: UpdateListingDto = { price: 275000 };

      repository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateDto, tenantId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete listing', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(mockListing as any);
      repository.save.mockResolvedValue({ ...mockListing, deletedAt: new Date() } as any);

      await service.remove(id, tenantId);

      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when listing not found for removal', async () => {
      const id = 'non-existent';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(id, tenantId)).rejects.toThrow(NotFoundException);
    });
  });
});