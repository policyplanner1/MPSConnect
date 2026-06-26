import {
  computeSipFutureValue,
  periodsPerYear,
} from '../../src/modules/calculators/utils/sipFormula';

describe('sipFormula (CALC-SIP-001, CALC-SIP-003, CALC-SIP-004)', () => {
  it('computes future value for monthly SIP defaults', () => {
    const result = computeSipFutureValue(5_000, 12, 10, 'monthly');
    expect(result.totalInvested).toBe(5_000 * 12 * 10);
    expect(result.futureValue).toBeGreaterThan(result.totalInvested);
    expect(result.estimatedReturns).toBeGreaterThan(0);
  });

  it('zero return yields FV equal to total invested', () => {
    const result = computeSipFutureValue(5_000, 0, 10, 'monthly');
    expect(result.futureValue).toBe(result.totalInvested);
    expect(result.estimatedReturns).toBe(0);
  });

  it('quarterly has fewer periods than monthly for same years', () => {
    const monthly = computeSipFutureValue(5_000, 12, 10, 'monthly');
    const quarterly = computeSipFutureValue(5_000, 12, 10, 'quarterly');
    expect(quarterly.futureValue).toBeLessThan(monthly.futureValue);
    expect(quarterly.totalInvested).toBeLessThan(monthly.totalInvested);
  });

  it('periodsPerYear returns 12 or 4', () => {
    expect(periodsPerYear('monthly')).toBe(12);
    expect(periodsPerYear('quarterly')).toBe(4);
  });
});
