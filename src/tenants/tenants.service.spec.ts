import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TenantsService } from './tenants.service';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UserRole } from '../auth/enums/user-role.enum';

jest.mock('bcrypt');

describe('TenantsService', () => {
  let service: TenantsService;
  let repository: jest.Mocked<Repository<Tenant>>;

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
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    repository = module.get(getRepositoryToken(Tenant));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a tenant successfully', async () => {
      const createDto: CreateTenantDto = {
        name: 'Test Tenant',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      repository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      repository.create.mockReturnValue(mockTenant as any);
      repository.save.mockResolvedValue(mockTenant as any);

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        password: 'hashedPassword',
      });
      expect(repository.save).toHaveBeenCalledWith(mockTenant);
      expect(result).toEqual(mockTenant);
    });

    it('should throw ConflictException when email already exists', async () => {
      const createDto: CreateTenantDto = {
        name: 'Test Tenant',
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      repository.findOne.mockResolvedValue(mockTenant as any);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
    });

    it('should handle bcrypt hash error', async () => {
      const createDto: CreateTenantDto = {
        name: 'Test Tenant',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      repository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash error'));

      await expect(service.create(createDto)).rejects.toThrow('Hash error');
    });
  });

  describe('findAll', () => {
    it('should return all tenants', async () => {
      const tenants = [mockTenant, { ...mockTenant, id: 'another-id' }];
      repository.find.mockResolvedValue(tenants as any);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(tenants);
    });

    it('should return empty array when no tenants exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return tenant with relations when found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      repository.findOne.mockResolvedValue(mockTenant as any);

      const result = await service.findOne(id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['properties', 'transactions', 'listings'],
      });
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException when tenant not found', async () => {
      const id = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['properties', 'transactions', 'listings'],
      });
    });
  });

  describe('findOneByEmail', () => {
    it('should return tenant when found by email', async () => {
      const email = 'test@example.com';
      repository.findOne.mockResolvedValue(mockTenant as any);

      const result = await service.findOneByEmail(email);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException when tenant not found by email', async () => {
      const email = 'nonexistent@example.com';
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOneByEmail(email)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });
});