import { AuthModule } from './auth.module';

describe('AuthModule', () => {
  it('should be defined', () => {
    expect(AuthModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof AuthModule).toBe('function');
  });
});