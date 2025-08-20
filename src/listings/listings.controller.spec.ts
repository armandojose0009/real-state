import { Test, TestingModule } from '@nestjs/testing';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingFilterDto } from './dto/listing-filter.dto';

describe('ListingsController', () => {
  let controller: ListingsController;
  let service: jest.Mocked<ListingsService>;

  const mockListing = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Beautiful House',
    description: 'A beautiful house in downtown',
    price: 250000,
    status: 'active',
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
      controllers: [ListingsController],
      providers: [
        {
          provide: ListingsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ListingsController>(ListingsController);
    service = module.get(ListingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a listing', async () => {
      const createDto: CreateListingDto = {
        title: 'Beautiful House',
        description: 'A beautiful house in downtown',
        price: 250000,
        status: 'active',
        propertyId: 'property-123',
        tenantId: 'tenant-123',
      };
      const tenantId = 'tenant-123';

      service.create.mockResolvedValue(mockListing as any);

      const result = await controller.create(createDto, tenantId);

      expect(service.create).toHaveBeenCalledWith({ ...createDto, tenantId });
      expect(result).toEqual(mockListing);
    });
  });

  describe('findAll', () => {
    it('should return paginated listings', async () => {
      const filterDto: ListingFilterDto = {};
      const tenantId = 'tenant-123';
      const mockResponse = {
        data: [mockListing],
        pagination: { total: 1, totalPages: 1, currentPage: 1, limit: 10, hasNext: false, hasPrev: false, nextPage: null, prevPage: null },
      };

      service.findAll.mockResolvedValue(mockResponse as any);

      const result = await controller.findAll(filterDto, tenantId);

      expect(service.findAll).toHaveBeenCalledWith(filterDto, tenantId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a listing by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      service.findOne.mockResolvedValue(mockListing as any);

      const result = await controller.findOne(id, tenantId);

      expect(service.findOne).toHaveBeenCalledWith(id, tenantId);
      expect(result).toEqual(mockListing);
    });
  });

  describe('update', () => {
    it('should update a listing', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateListingDto = { price: 275000 };
      const tenantId = 'tenant-123';

      service.update.mockResolvedValue({ ...mockListing, price: 275000 } as any);

      const result = await controller.update(id, updateDto, tenantId);

      expect(service.update).toHaveBeenCalledWith(id, updateDto, tenantId);
      expect(result.price).toBe(275000);
    });
  });

  describe('remove', () => {
    it('should remove a listing', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const tenantId = 'tenant-123';

      service.remove.mockResolvedValue(undefined);

      await controller.remove(id, tenantId);

      expect(service.remove).toHaveBeenCalledWith(id, tenantId);
    });
  });
});