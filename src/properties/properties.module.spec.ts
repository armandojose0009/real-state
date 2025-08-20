import { PropertiesModule } from './properties.module';

describe('PropertiesModule', () => {
  it('should be defined', () => {
    expect(PropertiesModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof PropertiesModule).toBe('function');
  });
});