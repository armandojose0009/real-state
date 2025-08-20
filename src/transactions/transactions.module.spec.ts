import { TransactionsModule } from './transactions.module';

describe('TransactionsModule', () => {
  it('should be defined', () => {
    expect(TransactionsModule).toBeDefined();
  });

  it('should be a module class', () => {
    expect(typeof TransactionsModule).toBe('function');
  });
});