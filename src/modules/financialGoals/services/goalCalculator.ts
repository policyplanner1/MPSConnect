/**
 * 1) Inflation-adjusted future goal: FV = PV × (1 + i)^n
 * 2) Required monthly SIP (annuity due): FV = SIP × ((1+r)^n − 1) / r × (1+r)
 * 3) Required lumpsum today: PV = FV / (1 + r)^n
 */

export type FinancialGoalInputs = {
  currentGoalCost: number;
  amountAlreadyHave: number;
  yearsToGoal: number;
  inflationRatePercent: number;
  expectedReturnPercent: number;
};

export type FinancialGoalResults = {
  futureGoalValue: number;
  amountAlreadyHave: number;
  amountStillRequired: number;
  yearsToGoal: number;
  requiredMonthlySip: number;
  requiredLumpsum: number;
};

const MONTHS_PER_YEAR = 12;

/** FV = PV × (1 + i)^n — i and n are annual. */
export function computeInflationAdjustedFutureValue(
  presentCost: number,
  inflationRatePercent: number,
  years: number,
): number {
  const pv = Math.max(0, presentCost);
  const n = Math.max(0, years);
  if (pv <= 0) {
    return 0;
  }
  const i = inflationRatePercent / 100;
  if (Math.abs(i) < 1e-12) {
    return pv;
  }
  const fv = pv * Math.pow(1 + i, n);
  return Number.isFinite(fv) ? fv : 0;
}

/** Monthly SIP for annuity-due FV formula. */
export function computeRequiredMonthlySip(
  futureValue: number,
  annualReturnPercent: number,
  years: number,
): number {
  const fv = Math.max(0, futureValue);
  const n = Math.max(1, Math.round(years * MONTHS_PER_YEAR));
  if (fv <= 0) {
    return 0;
  }

  const r = annualReturnPercent / 100 / MONTHS_PER_YEAR;
  if (Math.abs(r) < 1e-12) {
    return fv / n;
  }

  const pow = Math.pow(1 + r, n);
  const annuityFactor = ((pow - 1) / r) * (1 + r);
  if (annuityFactor <= 0 || !Number.isFinite(annuityFactor)) {
    return 0;
  }

  const sip = fv / annuityFactor;
  return Number.isFinite(sip) ? sip : 0;
}

/** Lumpsum PV = FV / (1 + r)^n — r annual, n in years. */
export function computeRequiredLumpsum(
  futureValue: number,
  annualReturnPercent: number,
  years: number,
): number {
  const fv = Math.max(0, futureValue);
  const n = Math.max(0, years);
  if (fv <= 0) {
    return 0;
  }
  if (n <= 0) {
    return fv;
  }

  const r = annualReturnPercent / 100;
  if (Math.abs(r) < 1e-12) {
    return fv;
  }

  const pv = fv / Math.pow(1 + r, n);
  return Number.isFinite(pv) ? pv : 0;
}

export function computeFinancialGoalPlan(
  inputs: FinancialGoalInputs,
): FinancialGoalResults {
  const futureGoalValue = computeInflationAdjustedFutureValue(
    inputs.currentGoalCost,
    inputs.inflationRatePercent,
    inputs.yearsToGoal,
  );

  const amountAlreadyHave = Math.min(
    Math.max(0, inputs.amountAlreadyHave),
    futureGoalValue,
  );
  const amountStillRequired = Math.max(0, futureGoalValue - amountAlreadyHave);

  return {
    futureGoalValue,
    amountAlreadyHave,
    amountStillRequired,
    yearsToGoal: inputs.yearsToGoal,
    requiredMonthlySip: computeRequiredMonthlySip(
      amountStillRequired,
      inputs.expectedReturnPercent,
      inputs.yearsToGoal,
    ),
    requiredLumpsum: computeRequiredLumpsum(
      amountStillRequired,
      inputs.expectedReturnPercent,
      inputs.yearsToGoal,
    ),
  };
}
