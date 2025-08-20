import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../auth/enums/user-role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
    } as any;
  };

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      const context = createMockExecutionContext({ role: UserRole.USER });
      reflector.get.mockReturnValue(undefined);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith('roles', context.getHandler());
    });

    it('should allow access when user has required role', () => {
      const context = createMockExecutionContext({ role: UserRole.ADMIN });
      reflector.get.mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const context = createMockExecutionContext({ role: UserRole.USER });
      reflector.get.mockReturnValue([UserRole.USER, UserRole.ADMIN]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      const context = createMockExecutionContext({ role: UserRole.USER });
      reflector.get.mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should deny access when user is undefined', () => {
      const context = createMockExecutionContext(undefined);
      reflector.get.mockReturnValue([UserRole.USER]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should deny access when user role is undefined', () => {
      const context = createMockExecutionContext({ role: undefined });
      reflector.get.mockReturnValue([UserRole.USER]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should handle empty required roles array', () => {
      const context = createMockExecutionContext({ role: UserRole.USER });
      reflector.get.mockReturnValue([]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should handle user with null role', () => {
      const context = createMockExecutionContext({ role: null });
      reflector.get.mockReturnValue([UserRole.USER]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });
});
