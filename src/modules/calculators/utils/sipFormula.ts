/**
 * SIP future value (annuity due — payment at start of each period):
 * FV = P × ((1+r)^n − 1) / r × (1+r)
 *
 * r = (annual rate % / 100) / periods per year
 * n = years × periods per year
 */
export type SipFrequency = 'monthly' | 'quarterly';

export type SipResult = {
  futureValue: number;
  totalInvested: number;
  estimatedReturns: number;
};

export function periodsPerYear(frequency: SipFrequency): number {
  return frequency === 'monthly' ? 12 : 4;
}

export function computeSipFutureValue(
  sipAmount: number,
  annualRatePercent: number,
  years: number,
  frequency: SipFrequency,
): SipResult {
  const ppy = periodsPerYear(frequency);
  const n = Math.max(0, Math.round(years * ppy));
  const P = sipAmount;

  if (P <= 0 || n <= 0) {
    return { futureValue: 0, totalInvested: 0, estimatedReturns: 0 };
  }

  const totalInvested = P * n;
  const r = annualRatePercent / 100 / ppy;

  let futureValue: number;
  if (Math.abs(r) < 1e-12) {
    futureValue = totalInvested;
  } else {
    const pow = Math.pow(1 + r, n);
    futureValue = (P * (pow - 1)) / r;
    futureValue *= 1 + r;
  }

  if (!Number.isFinite(futureValue)) {
    futureValue = 0;
  }

  return {
    futureValue,
    totalInvested,
    estimatedReturns: Math.max(0, futureValue - totalInvested),
  };
}
