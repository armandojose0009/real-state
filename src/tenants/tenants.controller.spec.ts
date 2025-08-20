import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UserRole } from '../auth/enums/user-role.enum';

describe('TenantsController', () => {
  let controller: TenantsController;
  let service: jest.Mocked<TenantsService>;

  const mockTenant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Tenant',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    properties: [],
    transactions: [],
    listings: [],
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findOneByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
    service = module.get(TenantsService);
  });

  describe('create', () => {
    it('should create a tenant', async () => {
      const createDto: CreateTenantDto = {
        name: 'Test Tenant',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      service.create.mockResolvedValue(mockTenant as any);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockTenant);
    });

    it('should handle service errors during creation', async () => {
      const createDto: CreateTenantDto = {
        name: 'Test Tenant',
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      service.create.mockRejectedValue(new Error('Email already in use'));

      await expect(controller.create(createDto)).rejects.toThrow('Email already in use');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle invalid input data', async () => {
      const invalidDto = {
        name: '',
        email: 'invalid-email',
        password: '123',
      };

      service.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(invalidDto)).rejects.toThrow('Validation failed');
    });
  });

  describe('findAll', () => {
    it('should return all tenants', async () => {
      const tenants = [
        mockTenant,
        {
          ...mockTenant,
          id: 'another-id',
          email: 'another@example.com',
        },
      ];

      service.findAll.mockResolvedValue(tenants as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(tenants);
    });

    it('should return empty array when no tenants exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      service.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      service.findOne.mockResolvedValue(mockTenant as any);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockTenant);
    });

    it('should handle tenant not found', async () => {
      const id = 'non-existent-id';

      service.findOne.mockRejectedValue(new Error('Tenant not found'));

      await expect(controller.findOne(id)).rejects.toThrow('Tenant not found');
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';

      // This would typically be caught by the ParseUUIDPipe before reaching the service
      // but we test the service call for completeness
      service.findOne.mockRejectedValue(new Error('Invalid UUID'));

      await expect(controller.findOne(invalidId)).rejects.toThrow('Invalid UUID');
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple tenants with different roles', async () => {
      const adminTenant = { ...mockTenant, role: UserRole.ADMIN };
      const userTenant = { ...mockTenant, id: 'user-id', role: UserRole.USER };
      const tenants = [adminTenant, userTenant];

      service.findAll.mockResolvedValue(tenants as any);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe(UserRole.ADMIN);
      expect(result[1].role).toBe(UserRole.USER);
    });

    it('should handle tenant with relations', async () => {
      const tenantWithRelations = {
        ...mockTenant,
        properties: [{ id: 'prop-1', address: '123 Main St' }],
        transactions: [{ id: 'trans-1', amount: 250000 }],
        listings: [{ id: 'list-1', title: 'Beautiful House' }],
      };

      service.findOne.mockResolvedValue(tenantWithRelations as any);

      const result = await controller.findOne(mockTenant.id);

      expect(result.properties).toHaveLength(1);
      expect(result.transactions).toHaveLength(1);
      expect(result.listings).toHaveLength(1);
    });
  });
});