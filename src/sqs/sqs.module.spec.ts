import { SqsModule } from './sqs.module';

describe('SqsModule', () => {
  it('should be defined', () => {
    expect(SqsModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof SqsModule).toBe('function');
  });
});