import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilterDto } from './dto/property-filter.dto';

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let service: jest.Mocked<PropertiesService>;

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

  const mockPaginationResponse = {
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

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
      findByRadius: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        {
          provide: PropertiesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
    service = module.get(PropertiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a property', async () => {
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
      const tenantId = 'tenant-123';

      service.create.mockResolvedValue(mockProperty as any);

      const result = await controller.create(createDto, tenantId);

      expect(service.create).toHaveBeenCalledWith({ ...createDto, tenantId });
      expect(result).toEqual(mockProperty);
    });
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      const filterDto: PropertyFilterDto = { limit: 10, offset: 0 };
      const tenantId = 'tenant-123';

      service.findAll.mockResolvedValue(mockPaginationResponse as any);

      const result = await controller.findAll(filterDto, tenantId);

      expect(service.findAll).toHaveBeenCalledWith(filterDto, tenantId);
      expect(result).toEqual(mockPaginationResponse);
    });
  });

  describe('findByRadius', () => {
    it('should return nearby properties', async () => {
      const lat = 40.7128;
      const lng = -74.006;
      const radius = 1000;
      const tenantId = 'tenant-123';

      service.findByRadius.mockResolvedValue([mockProperty] as any);

      const result = await controller.findByRadius(lat, lng, radius, tenantId);

      expect(service.findByRadius).toHaveBeenCalledWith(
        lat,
        lng,
        radius,
        tenantId,
      );
      expect(result).toEqual([mockProperty]);
    });
  });

  describe('findOne', () => {
    it('should return a property by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      service.findOne.mockResolvedValue(mockProperty as any);

      const result = await controller.findOne(id, tenantId);

      expect(service.findOne).toHaveBeenCalledWith(id, tenantId);
      expect(result).toEqual(mockProperty);
    });
  });

  describe('update', () => {
    it('should update a property', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdatePropertyDto = { valuation: 275000 };
      const tenantId = 'tenant-123';
      const updatedProperty = { ...mockProperty, valuation: 275000 };

      service.update.mockResolvedValue(updatedProperty as any);

      const result = await controller.update(id, updateDto, tenantId);

      expect(service.update).toHaveBeenCalledWith(id, updateDto, tenantId);
      expect(result).toEqual(updatedProperty);
    });
  });

  describe('remove', () => {
    it('should remove a property', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(id, tenantId);

      expect(service.remove).toHaveBeenCalledWith(id, tenantId);
      expect(result).toBeUndefined();
    });
  });

  describe('restore', () => {
    it('should restore a deleted property', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';
      const restoredProperty = { ...mockProperty, deletedAt: null };

      service.restore.mockResolvedValue(restoredProperty as any);

      const result = await controller.restore(id, tenantId);

      expect(service.restore).toHaveBeenCalledWith(id, tenantId);
      expect(result).toEqual(restoredProperty);
    });
  });
});
