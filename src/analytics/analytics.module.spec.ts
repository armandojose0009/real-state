import { AnalyticsModule } from './analytics.module';

describe('AnalyticsModule', () => {
  it('should be defined', () => {
    expect(AnalyticsModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof AnalyticsModule).toBe('function');
  });
});