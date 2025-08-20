import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserRole } from './enums/user-role.enum';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let tenantsRepository: jest.Mocked<Repository<Tenant>>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockTenant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Tenant',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tenantsRepository = module.get(getRepositoryToken(Tenant));
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return tenant when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      tenantsRepository.findOne.mockResolvedValue(mockTenant as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(tenantsRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockTenant.password);
      expect(result).toEqual(mockTenant);
    });

    it('should throw UnauthorizedException when tenant not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      tenantsRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(email, password)).rejects.toThrow(UnauthorizedException);
      expect(tenantsRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      tenantsRepository.findOne.mockResolvedValue(mockTenant as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockTenant.password);
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedPayload = {
        sub: mockTenant.id,
        email: mockTenant.email,
        role: mockTenant.role,
        tenantId: mockTenant.id,
      };

      tenantsRepository.findOne.mockResolvedValue(mockTenant as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      configService.get.mockReturnValueOnce('7d').mockReturnValueOnce('refresh-secret');

      const result = await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload, {
        expiresIn: '7d',
        secret: 'refresh-secret',
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      tenantsRepository.findOne.mockResolvedValue(mockTenant as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const mockPayload = {
        sub: mockTenant.id,
        email: mockTenant.email,
        role: mockTenant.role,
        tenantId: mockTenant.id,
      };

      jwtService.verify.mockReturnValue(mockPayload);
      tenantsRepository.findOne.mockResolvedValue(mockTenant as any);
      jwtService.sign.mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token');
      configService.get.mockReturnValueOnce('refresh-secret').mockReturnValueOnce('7d').mockReturnValueOnce('refresh-secret');

      const result = await service.refreshToken(refreshTokenDto);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'refresh-secret',
      });
      expect(tenantsRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTenant.id },
      });
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      configService.get.mockReturnValue('refresh-secret');
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when tenant not found', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const mockPayload = {
        sub: 'non-existent-id',
        email: 'test@example.com',
        role: UserRole.USER,
        tenantId: 'non-existent-id',
      };

      jwtService.verify.mockReturnValue(mockPayload);
      tenantsRepository.findOne.mockResolvedValue(null);
      configService.get.mockReturnValue('refresh-secret');

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});