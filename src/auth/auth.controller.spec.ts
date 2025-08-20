import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockTokenResponse = {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  };

  beforeEach(async () => {
    const mockService = {
      login: jest.fn(),
      refreshToken: jest.fn(),
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  describe('login', () => {
    it('should return access and refresh tokens on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      service.login.mockResolvedValue(mockTokenResponse);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockTokenResponse);
    });

    it('should handle invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      service.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle non-existent user', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      service.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle empty credentials', async () => {
      const loginDto: LoginDto = {
        email: '',
        password: '',
      };

      service.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle malformed email', async () => {
      const loginDto: LoginDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      service.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new tokens on successful refresh', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const newTokenResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      service.refreshToken.mockResolvedValue(newTokenResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(service.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
      expect(result).toEqual(newTokenResponse);
    });

    it('should handle invalid refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      service.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      expect(service.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });

    it('should handle expired refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'expired-refresh-token',
      };

      service.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle malformed refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'malformed.token',
      };

      service.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle empty refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: '',
      };

      service.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('integration scenarios', () => {
    it('should handle successful login followed by token refresh', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: mockTokenResponse.refreshToken,
      };

      service.login.mockResolvedValue(mockTokenResponse);
      service.refreshToken.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      // First login
      const loginResult = await controller.login(loginDto);
      expect(loginResult).toEqual(mockTokenResponse);

      // Then refresh
      const refreshResult = await controller.refresh(refreshTokenDto);
      expect(refreshResult.accessToken).toBe('new-access-token');
      expect(refreshResult.refreshToken).toBe('new-refresh-token');
    });

    it('should handle service errors gracefully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      service.login.mockRejectedValue(new Error('Database connection error'));

      await expect(controller.login(loginDto)).rejects.toThrow('Database connection error');
    });
  });
});