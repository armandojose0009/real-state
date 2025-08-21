import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilterDto } from './dto/property-filter.dto';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let repository: jest.Mocked<Repository<Property>>;
  let cacheManager: jest.Mocked<any>;

  const mockProperty = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    address: '123 Main St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    sector: 'Downtown',
    propertyType: 'House',
    valuation: 250000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1500,
    yearBuilt: 2020,
    tenantId: 'tenant-123',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
        getMany: jest.fn(),
      })),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    repository = module.get(getRepositoryToken(Property));
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('create', () => {
    it('should create a property successfully', async () => {
      const createDto: CreatePropertyDto = {
        address: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        sector: 'Downtown',
        propertyType: 'House',
        latitude: 40.7128,
        longitude: -74.006,
        valuation: 250000,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1500,
        yearBuilt: 2020,
        tenantId: 'tenant-123',
      };

      repository.create.mockReturnValue(mockProperty as any);
      repository.save.mockResolvedValue(mockProperty as any);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockProperty);
      expect(result).toEqual(mockProperty);
    });

    it('should throw error when tenantId is missing', async () => {
      const createDto = { address: '123 Main St' } as CreatePropertyDto;

      await expect(service.create(createDto)).rejects.toThrow(
        'tenantId is required to invalidate cache',
      );
    });
  });

  describe('findAll', () => {
    it('should return cached results when available', async () => {
      const filterDto: PropertyFilterDto = { limit: 10, offset: 0 };
      const tenantId = 'tenant-123';
      const cachedResult = {
        data: [mockProperty],
        pagination: {
          total: 1,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false,
          nextPage: null,
          prevPage: null,
        },
      };

      cacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.findAll(filterDto, tenantId);

      expect(cacheManager.get).toHaveBeenCalled();
      expect(result).toEqual(cachedResult);
    });

    it('should query database and cache results when not cached', async () => {
      const filterDto: PropertyFilterDto = { limit: 10, offset: 0 };
      const tenantId = 'tenant-123';
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProperty], 1]),
      };

      cacheManager.get.mockResolvedValue(null);
      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAll(filterDto, tenantId);

      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result.data).toEqual([mockProperty]);
    });

    it('should apply filters correctly', async () => {
      const filterDto: PropertyFilterDto = {
        sector: 'Downtown',
        propertyType: 'House',
        minPrice: 200000,
        maxPrice: 300000,
        search: 'Main',
        sort: 'valuation',
        order: 'DESC',
        limit: 5,
        offset: 10,
      };
      const tenantId = 'tenant-123';
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProperty], 1]),
      };

      cacheManager.get.mockResolvedValue(null);
      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(filterDto, tenantId);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'property.sector = :sector',
        { sector: 'Downtown' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'property.propertyType = :propertyType',
        { propertyType: 'House' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'property.valuation BETWEEN :minPrice AND :maxPrice',
        {
          minPrice: 200000,
          maxPrice: 300000,
        },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'property.address ILIKE :search',
        { search: '%Main%' },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'property.valuation',
        'DESC',
      );
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    });
  });

  describe('findOne', () => {
    it('should return property when found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(mockProperty as any);

      const result = await service.findOne(id, tenantId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id, tenantId, deletedAt: expect.any(Object) },
      });
      expect(result).toEqual(mockProperty);
    });

    it('should throw NotFoundException when property not found', async () => {
      const id = 'non-existent';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id, tenantId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update property successfully', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';
      const updateDto: UpdatePropertyDto = { valuation: 275000 };
      const updatedProperty = { ...mockProperty, valuation: 275000 };

      repository.findOne.mockResolvedValue(mockProperty as any);
      repository.save.mockResolvedValue(updatedProperty as any);

      const result = await service.update(id, updateDto, tenantId);

      expect(repository.save).toHaveBeenCalled();
      expect(result.valuation).toBe(275000);
    });
  });

  describe('remove', () => {
    it('should soft delete property', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(mockProperty as any);
      repository.save.mockResolvedValue({
        ...mockProperty,
        deletedAt: new Date(),
      } as any);

      await service.remove(id, tenantId);

      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore deleted property', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';
      const deletedProperty = { ...mockProperty, deletedAt: new Date() };

      repository.findOne.mockResolvedValue(deletedProperty as any);
      repository.save.mockResolvedValue({
        ...deletedProperty,
        deletedAt: null,
      } as any);

      const result = await service.restore(id, tenantId);

      expect(repository.save).toHaveBeenCalled();
      expect(result.deletedAt).toBeNull();
    });

    it('should throw NotFoundException when deleted property not found', async () => {
      const id = 'non-existent';
      const tenantId = 'tenant-123';

      repository.findOne.mockResolvedValue(null);

      await expect(service.restore(id, tenantId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByRadius', () => {
    it('should return cached results when available', async () => {
      const lat = 40.7128;
      const lng = -74.006;
      const radius = 1000;
      const tenantId = 'tenant-123';

      cacheManager.get.mockResolvedValue([mockProperty]);

      const result = await service.findByRadius(lat, lng, radius, tenantId);

      expect(cacheManager.get).toHaveBeenCalled();
      expect(result).toEqual([mockProperty]);
    });

    it('should query database and cache results when not cached', async () => {
      const lat = 40.7128;
      const lng = -74.006;
      const radius = 1000;
      const tenantId = 'tenant-123';
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProperty]),
      };

      cacheManager.get.mockResolvedValue(null);
      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findByRadius(lat, lng, radius, tenantId);

      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result).toEqual([mockProperty]);
    });
  });
});
