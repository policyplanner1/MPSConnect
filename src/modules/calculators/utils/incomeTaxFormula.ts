import type { DomesticCompanyRate, TaxpayerType } from '../constants/incomeTaxPayers';

export type TaxRegime = 'new' | 'old';
export type AgeCategory = 0 | 1 | 2;

export type IncomeTaxInputs = {
  taxpayerType: TaxpayerType;
  regime: TaxRegime;
  ageIdx: AgeCategory;
  salary: number;
  rental: number;
  other: number;
  interest: number;
  sec80C: number;
  sec80D: number;
  hra: number;
  homeLoanInterest: number;
  sec80E: number;
  nps: number;
  /** Total taxable income for firms, companies, local authority, etc. */
  totalIncome: number;
  domesticCompanyRate: DomesticCompanyRate;
  /** Section 115BAD – co-operative society optional flat 22% */
  coopOpt115BAD: boolean;
};

export type SlabDetail = {
  label: string;
  taxed: number;
  color: string;
};

export type IncomeTaxResult = {
  taxpayerLabel: string;
  gross: number;
  stdDed: number;
  otherDed: number;
  taxable: number;
  taxBeforeCess: number;
  surcharge: number;
  rebate87A: number;
  cess: number;
  total: number;
  slabDetails: SlabDetail[];
  /** New vs old comparison (individual / HUF / AOP only) */
  showRegimeCompare: boolean;
  newTotal: number | null;
  oldTotal: number | null;
  effRate: number;
  monthlyTax: number;
  takeHomeMonthly: number | null;
  rateNote: string | null;
};

const SLAB_COLORS = [
  '#9FE1CB',
  '#5DCAA5',
  '#1D9E75',
  '#0F6E56',
  '#085041',
  '#04342C',
  '#2C2C2A',
];

const DOMESTIC_RATE_MAP: Record<DomesticCompanyRate, number> = {
  '30': 0.3,
  '25': 0.25,
  '22': 0.22,
  '15': 0.15,
};

export function calcTaxNew(taxable: number): number {
  if (taxable <= 0) {
    return 0;
  }
  const slabs: [number, number][] = [
    [400_000, 0],
    [800_000, 0.05],
    [1_200_000, 0.1],
    [1_600_000, 0.15],
    [2_000_000, 0.2],
    [2_400_000, 0.25],
    [Infinity, 0.3],
  ];
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of slabs) {
    if (taxable <= prev) {
      break;
    }
    tax += (Math.min(taxable, limit) - prev) * rate;
    prev = limit;
    if (limit === Infinity) {
      break;
    }
  }
  return tax;
}

export function calcTaxOld(taxable: number, age: AgeCategory): number {
  if (taxable <= 0) {
    return 0;
  }
  const exempt = age === 0 ? 250_000 : age === 1 ? 300_000 : 500_000;
  if (taxable <= exempt) {
    return 0;
  }
  const slabs: [number, number][] = [
    [500_000, 0.05],
    [1_000_000, 0.2],
    [Infinity, 0.3],
  ];
  let tax = 0;
  let prev = exempt;
  for (const [limit, rate] of slabs) {
    if (taxable <= prev) {
      break;
    }
    tax += (Math.min(taxable, limit) - prev) * rate;
    prev = limit;
    if (limit === Infinity) {
      break;
    }
  }
  return tax;
}

/** HUF / AOP / BOI – old regime (no senior citizen slabs) */
function calcTaxOldNonIndividual(taxable: number): number {
  return calcTaxOld(taxable, 0);
}

function calcCooperativeSlabTax(taxable: number): number {
  if (taxable <= 0) {
    return 0;
  }
  if (taxable <= 10_000) {
    return taxable * 0.1;
  }
  if (taxable <= 20_000) {
    return 1_000 + (taxable - 10_000) * 0.2;
  }
  return 3_000 + (taxable - 20_000) * 0.3;
}

function calcFlatTax(taxable: number, rate: number): number {
  return Math.max(0, taxable * rate);
}

/** Individual, HUF, AOP – surcharge on tax (FY 2025-26 new regime cap 25% above ₹2 cr) */
export function surchargeIndividualLike(
  tax: number,
  income: number,
  capAt25 = false,
): number {
  if (income <= 5_000_000) {
    return 0;
  }
  let rate = 0;
  if (income <= 10_000_000) {
    rate = 0.1;
  } else if (income <= 20_000_000) {
    rate = 0.15;
  } else if (income <= 50_000_000) {
    rate = 0.25;
  } else {
    rate = capAt25 ? 0.25 : 0.37;
  }
  return tax * rate;
}

/** Firm, LLP, local authority, co-op – 12% if total income > ₹1 crore */
function surchargeFirmLike(tax: number, income: number): number {
  if (income <= 1_00_00_000) {
    return 0;
  }
  return tax * 0.12;
}

/** Domestic company – 7% / 12% on tax; 115BAA/BAB use 10% above ₹1 crore */
function surchargeDomesticCompany(
  tax: number,
  income: number,
  rateId: DomesticCompanyRate,
): number {
  if (income <= 1_00_00_000) {
    return 0;
  }
  if (rateId === '22' || rateId === '15') {
    return tax * 0.1;
  }
  if (income <= 10_00_00_000) {
    return tax * 0.07;
  }
  return tax * 0.12;
}

/** Foreign company – 2% / 5% on tax */
function surchargeForeignCompany(tax: number, income: number): number {
  if (income <= 1_00_00_000) {
    return 0;
  }
  if (income <= 10_00_00_000) {
    return tax * 0.02;
  }
  return tax * 0.05;
}

function getAgeExempt(ageIdx: AgeCategory): number {
  if (ageIdx === 1) {
    return 300_000;
  }
  if (ageIdx === 2) {
    return 500_000;
  }
  return 250_000;
}

function buildSlabDetailsFromTax(
  taxable: number,
  isNew: boolean,
  ageIdx: AgeCategory,
  forNonIndividual: boolean,
): SlabDetail[] {
  const details: SlabDetail[] = [];
  let slabs: [number, number, number, string][];

  if (isNew) {
    slabs = [
      [0, 400_000, 0, 'Up to ₹4L'],
      [400_000, 800_000, 0.05, '₹4L–8L'],
      [800_000, 1_200_000, 0.1, '₹8L–12L'],
      [1_200_000, 1_600_000, 0.15, '₹12L–16L'],
      [1_600_000, 2_000_000, 0.2, '₹16L–20L'],
      [2_000_000, 2_400_000, 0.25, '₹20L–24L'],
      [2_400_000, Infinity, 0.3, 'Above ₹24L'],
    ];
  } else {
    const ex = forNonIndividual ? 250_000 : getAgeExempt(ageIdx);
    slabs = [
      [0, ex, 0, 'Exempt'],
      [ex, 500_000, 0.05, '5% slab'],
      [500_000, 1_000_000, 0.2, '20% slab'],
      [1_000_000, Infinity, 0.3, '30% slab'],
    ];
  }

  slabs.forEach(([lo, hi, rate, label], i) => {
    if (taxable <= lo) {
      return;
    }
    const taxed = (Math.min(taxable, hi === Infinity ? taxable : hi) - lo) * rate;
    if (taxed > 0 || rate === 0) {
      details.push({
        label: `${label} @ ${(rate * 100).toFixed(0)}%`,
        taxed,
        color: SLAB_COLORS[i] ?? '#1D9E75',
      });
    }
  });

  return details;
}

function buildFlatSlabDetail(taxable: number, rate: number, label: string): SlabDetail[] {
  const tax = taxable * rate;
  if (taxable <= 0) {
    return [];
  }
  return [
    {
      label: `${label} @ ${(rate * 100).toFixed(0)}%`,
      taxed: tax,
      color: SLAB_COLORS[3],
    },
  ];
}

function buildCoopSlabDetails(taxable: number): SlabDetail[] {
  if (taxable <= 0) {
    return [];
  }
  const parts: SlabDetail[] = [];
  if (taxable > 0) {
    const t1 = Math.min(taxable, 10_000) * 0.1;
    if (t1 > 0) {
      parts.push({ label: 'Up to ₹10K @ 10%', taxed: t1, color: SLAB_COLORS[0] });
    }
  }
  if (taxable > 10_000) {
    const t2 = Math.min(taxable - 10_000, 10_000) * 0.2;
    if (t2 > 0) {
      parts.push({ label: '₹10K–20K @ 20%', taxed: t2, color: SLAB_COLORS[2] });
    }
  }
  if (taxable > 20_000) {
    const t3 = (taxable - 20_000) * 0.3;
    parts.push({ label: 'Above ₹20K @ 30%', taxed: t3, color: SLAB_COLORS[4] });
  }
  return parts;
}

function sumOtherDeductions(inputs: IncomeTaxInputs): number {
  const c80C = Math.min(inputs.sec80C, 150_000);
  const hl = Math.min(inputs.homeLoanInterest, 200_000);
  const npsCap = Math.min(inputs.nps, 50_000);
  return c80C + inputs.sec80D + inputs.hra + hl + inputs.sec80E + npsCap;
}

function grossFromIncomeFields(inputs: IncomeTaxInputs): number {
  return inputs.salary + inputs.rental + inputs.other + inputs.interest;
}

function finalizeTax(
  tax: number,
  taxable: number,
  surchargeFn: (t: number, i: number) => number,
  rebate: number,
  slabDetails: SlabDetail[],
  gross: number,
  showMonthlyTakeHome: boolean,
): Pick<
  IncomeTaxResult,
  | 'taxBeforeCess'
  | 'surcharge'
  | 'rebate87A'
  | 'cess'
  | 'total'
  | 'slabDetails'
  | 'effRate'
  | 'monthlyTax'
  | 'takeHomeMonthly'
> {
  const sc = surchargeFn(tax, taxable);
  const afterRebate = Math.max(0, tax + sc - rebate);
  const cess = afterRebate * 0.04;
  const total = afterRebate + cess;
  return {
    taxBeforeCess: tax,
    surcharge: sc,
    rebate87A: rebate,
    cess,
    total,
    slabDetails,
    effRate: gross > 0 ? (total / gross) * 100 : 0,
    monthlyTax: total / 12,
    takeHomeMonthly: showMonthlyTakeHome ? (gross - total) / 12 : null,
  };
}

function computeIndividualLikeTotal(
  gross: number,
  stdDed: number,
  otherDed: number,
  isNew: boolean,
  ageIdx: AgeCategory,
  allow87A: boolean,
): number {
  const taxable = Math.max(0, gross - stdDed - otherDed);
  const taxRaw = isNew ? calcTaxNew(taxable) : calcTaxOld(taxable, ageIdx);
  let rebate = 0;
  if (allow87A && isNew && taxable <= 1_200_000) {
    rebate = Math.min(taxRaw, 60_000);
  }
  if (allow87A && !isNew && taxable <= 500_000) {
    rebate = Math.min(taxRaw, 12_500);
  }
  const sc = surchargeIndividualLike(taxRaw, taxable, isNew);
  return Math.max(0, (taxRaw + sc - rebate) * 1.04);
}

export function calculateIncomeTax(inputs: IncomeTaxInputs): IncomeTaxResult {
  const { taxpayerType, regime, ageIdx, domesticCompanyRate, coopOpt115BAD } = inputs;

  const taxpayerLabel =
    taxpayerType === 'aopBoi'
      ? 'AOP / BOI'
      : taxpayerType === 'firm'
        ? 'Firm / LLP'
        : taxpayerType === 'domesticCompany'
          ? 'Domestic company'
          : taxpayerType === 'foreignCompany'
            ? 'Foreign company'
            : taxpayerType === 'cooperative'
              ? 'Co-operative society'
              : taxpayerType === 'localAuthority'
                ? 'Local authority'
                : taxpayerType === 'huf'
                  ? 'HUF'
                  : 'Individual';

  let gross = 0;
  let stdDed = 0;
  let otherDed = 0;
  let taxable = 0;
  let tax = 0;
  let rebate87A = 0;
  let slabDetails: SlabDetail[] = [];
  let showRegimeCompare = false;
  let newTotal: number | null = null;
  let oldTotal: number | null = null;
  let rateNote: string | null = null;
  let showMonthlyTakeHome = false;

  const canUseRegime =
    taxpayerType === 'individual' ||
    taxpayerType === 'huf' ||
    taxpayerType === 'aopBoi';

  if (canUseRegime) {
    showRegimeCompare = true;
    gross =
      taxpayerType === 'individual'
        ? grossFromIncomeFields(inputs)
        : Math.max(inputs.totalIncome, grossFromIncomeFields(inputs));

    stdDed =
      regime === 'new' && taxpayerType === 'individual' ? 75_000 : regime === 'old' && taxpayerType === 'individual' ? 50_000 : 0;

    if (regime === 'old') {
      otherDed = sumOtherDeductions(inputs);
    }

    taxable = Math.max(0, gross - stdDed - otherDed);
    const forNonIndividual = taxpayerType !== 'individual';

    if (regime === 'new') {
      tax = calcTaxNew(taxable);
      if (taxpayerType === 'individual' && taxable <= 1_200_000) {
        rebate87A = Math.min(tax, 60_000);
      }
    } else {
      tax = forNonIndividual
        ? calcTaxOldNonIndividual(taxable)
        : calcTaxOld(taxable, ageIdx);
      if (taxpayerType === 'individual' && taxable <= 500_000) {
        rebate87A = Math.min(tax, 12_500);
      }
    }

    slabDetails = buildSlabDetailsFromTax(
      taxable,
      regime === 'new',
      ageIdx,
      forNonIndividual,
    );
    showMonthlyTakeHome = taxpayerType === 'individual';

    const otherDedForCompare = sumOtherDeductions(inputs);
    if (taxpayerType === 'individual') {
      newTotal = computeIndividualLikeTotal(gross, 75_000, 0, true, ageIdx, true);
      oldTotal = computeIndividualLikeTotal(
        gross,
        50_000,
        otherDedForCompare,
        false,
        ageIdx,
        true,
      );
    } else {
      newTotal = computeIndividualLikeTotal(gross, 0, 0, true, 0, false);
      oldTotal = computeIndividualLikeTotal(gross, 0, otherDedForCompare, false, 0, false);
    }
  } else if (taxpayerType === 'firm' || taxpayerType === 'localAuthority') {
    gross = inputs.totalIncome;
    taxable = Math.max(0, gross);
    tax = calcFlatTax(taxable, 0.3);
    slabDetails = buildFlatSlabDetail(taxable, 0.3, 'Flat rate');
    rateNote = '30% on total income (First Schedule – Firm / Local authority)';
  } else if (taxpayerType === 'domesticCompany') {
    gross = inputs.totalIncome;
    taxable = Math.max(0, gross);
    const rate = DOMESTIC_RATE_MAP[domesticCompanyRate];
    tax = calcFlatTax(taxable, rate);
    slabDetails = buildFlatSlabDetail(taxable, rate, 'Corporate tax');
    rateNote = `Domestic company @ ${(rate * 100).toFixed(0)}% (incl. optional 115BAA/BAB/BA)`;
  } else if (taxpayerType === 'foreignCompany') {
    gross = inputs.totalIncome;
    taxable = Math.max(0, gross);
    tax = calcFlatTax(taxable, 0.4);
    slabDetails = buildFlatSlabDetail(taxable, 0.4, 'Foreign company');
    rateNote = '40% on total income (other than special rate income)';
  } else if (taxpayerType === 'cooperative') {
    gross = inputs.totalIncome;
    taxable = Math.max(0, gross);
    if (coopOpt115BAD) {
      tax = calcFlatTax(taxable, 0.22);
      slabDetails = buildFlatSlabDetail(taxable, 0.22, 'Section 115BAD');
      rateNote = 'Optional flat 22% under Section 115BAD';
    } else {
      tax = calcCooperativeSlabTax(taxable);
      slabDetails = buildCoopSlabDetails(taxable);
      rateNote = 'Default co-operative society slab rates';
    }
  }

  let surchargeFn: (t: number, i: number) => number;
  if (canUseRegime) {
    surchargeFn = (t, i) => surchargeIndividualLike(t, i, regime === 'new');
  } else if (taxpayerType === 'foreignCompany') {
    surchargeFn = surchargeForeignCompany;
  } else if (taxpayerType === 'domesticCompany') {
    surchargeFn = (t, i) => surchargeDomesticCompany(t, i, domesticCompanyRate);
  } else {
    surchargeFn = surchargeFirmLike;
  }

  const finalized = finalizeTax(
    tax,
    taxable,
    surchargeFn,
    rebate87A,
    slabDetails,
    gross,
    showMonthlyTakeHome,
  );

  return {
    taxpayerLabel,
    gross,
    stdDed,
    otherDed,
    taxable,
    ...finalized,
    showRegimeCompare,
    newTotal,
    oldTotal,
    rateNote,
  };
}
