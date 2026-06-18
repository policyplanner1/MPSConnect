/**
 * Standard EMI (image formula):
 * E = P · r · (1+r)^n / ((1+r)^n − 1)
 * r = annual interest % / 12 / 100
 * n = tenure in months
 */
export function monthlyRateFromAnnualPercent(annualPercent: number): number {
  return annualPercent / 12 / 100;
}

export function computeEMI(
  principal: number,
  annualPercent: number,
  tenureMonths: number,
): number {
  if (principal <= 0 || tenureMonths <= 0) {
    return 0;
  }
  if (annualPercent <= 0) {
    return principal / tenureMonths;
  }
  const r = monthlyRateFromAnnualPercent(annualPercent);
  const pow = Math.pow(1 + r, tenureMonths);
  const emi = (principal * r * pow) / (pow - 1);
  return Number.isFinite(emi) ? emi : 0;
}

export type ExtraPayMode = 'year' | 'month';

export type LoanSimulationResult = {
  monthsToClose: number;
  totalPaid: number;
  totalInterest: number;
};

/**
 * Fixed EMI each month; optional extra reduces principal (prepayment).
 * - `extraYear`: lump sum at end of each 12-month block (after that month's EMI).
 * - `extraMonth`: same extra every month after EMI principal.
 */
export function simulateLoanWithExtraPayments(
  principal: number,
  annualPercent: number,
  contractualTenureMonths: number,
  extraAmount: number,
  extraMode: ExtraPayMode,
): LoanSimulationResult {
  const emi = computeEMI(principal, annualPercent, contractualTenureMonths);
  if (principal <= 0 || emi <= 0) {
    return { monthsToClose: 0, totalPaid: 0, totalInterest: 0 };
  }

  const r = monthlyRateFromAnnualPercent(annualPercent);
  let balance = principal;
  let totalPaid = 0;
  let months = 0;
  const maxMonths = 6000;

  while (balance > 0.01 && months < maxMonths) {
    months += 1;
    const interest = r > 0 ? balance * r : 0;
    let principalPart = emi - interest;
    if (principalPart < 0) {
      principalPart = 0;
    }
    if (principalPart > balance) {
      principalPart = balance;
    }
    const payment = interest + principalPart;
    balance -= principalPart;
    totalPaid += payment;

    if (extraAmount > 0) {
      if (extraMode === 'month') {
        const prepay = Math.min(extraAmount, balance);
        balance -= prepay;
        totalPaid += prepay;
      } else if (extraMode === 'year' && months % 12 === 0) {
        const prepay = Math.min(extraAmount, balance);
        balance -= prepay;
        totalPaid += prepay;
      }
    }

    if (balance < 0.01) {
      balance = 0;
    }
  }

  const totalInterest = Math.max(0, totalPaid - principal);
  return { monthsToClose: months, totalPaid, totalInterest };
}

export function baselineTotals(
  principal: number,
  annualPercent: number,
  tenureMonths: number,
): { totalPaid: number; totalInterest: number } {
  const emi = computeEMI(principal, annualPercent, tenureMonths);
  const totalPaid = emi * tenureMonths;
  const totalInterest = Math.max(0, totalPaid - principal);
  return { totalPaid, totalInterest };
}
