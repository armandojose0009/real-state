import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { Property } from '../../src/properties/entities/property.entity';
import { PropertiesService } from '../../src/properties/properties.service';
import { PropertyFilterDto } from '../../src/properties/dto/property-filter.dto';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let propertyRepository: Repository<Property>;
  let cacheManager: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            store: {
              keys: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    propertyRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return properties from cache if available', async () => {
      const cachedData = {
        data: [{ id: '1', address: '123 Main St' }],
        count: 1,
      };
      const filterDto = new PropertyFilterDto();
      const tenantId = 'tenant-1';

      cacheManager.get.mockResolvedValue(cachedData);

      const result = await service.findAll(filterDto, tenantId);

      expect(result).toEqual(cachedData);
      expect(cacheManager.get).toHaveBeenCalled();
      expect(propertyRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('should query database and cache result if not in cache', async () => {
      const filterDto = new PropertyFilterDto();
      const tenantId = 'tenant-1';
      const mockData = [{ id: '1', address: '123 Main St' }];
      const mockCount = 1;

      cacheManager.get.mockResolvedValue(null);
      jest
        .spyOn(propertyRepository, 'findAndCount')
        .mockResolvedValue([mockData, mockCount]);

      const result = await service.findAll(filterDto, tenantId);

      expect(result).toEqual({ data: mockData, count: mockCount });
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return property if found', async () => {
      const property = {
        id: '1',
        address: '123 Main St',
        tenantId: 'tenant-1',
      };
      jest
        .spyOn(propertyRepository, 'findOne')
        .mockResolvedValue(property as Property);

      const result = await service.findOne('1', 'tenant-1');

      expect(result).toEqual(property);
    });

    it('should throw NotFoundException if property not found', async () => {
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1', 'tenant-1')).rejects.toThrowError(
        'Property not found',
      );
    });
  });
});
