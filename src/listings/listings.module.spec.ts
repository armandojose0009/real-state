import { ListingsModule } from './listings.module';

describe('ListingsModule', () => {
  it('should be defined', () => {
    expect(ListingsModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof ListingsModule).toBe('function');
  });
});