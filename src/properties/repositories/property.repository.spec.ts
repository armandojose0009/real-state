import { PropertyRepository } from './property.repository';

describe('PropertyRepository', () => {
  let repository: PropertyRepository;

  beforeEach(() => {
    repository = new PropertyRepository();

    repository.createQueryBuilder = jest.fn();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findWithFilters', () => {
    it('should find properties with filters', async () => {
      const filterDto = {
        sector: 'Downtown',
        propertyType: 'House',
        minPrice: 200000,
        maxPrice: 300000,
        limit: 10,
        offset: 0,
      };
      const tenantId = 'tenant-123';

      const mockProperties = [
        {
          id: '1',
          address: '123 Main St',
          sector: 'Downtown',
          propertyType: 'House',
        },
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockProperties, 1]),
      };

      (repository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );

      const result = await repository.findWithFilters(filterDto, tenantId);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('property');
      expect(result).toEqual([mockProperties, 1]);
    });
  });
});
