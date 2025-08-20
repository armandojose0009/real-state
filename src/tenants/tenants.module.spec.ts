import { TenantsModule } from './tenants.module';

describe('TenantsModule', () => {
  it('should be defined', () => {
    expect(TenantsModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof TenantsModule).toBe('function');
  });
});