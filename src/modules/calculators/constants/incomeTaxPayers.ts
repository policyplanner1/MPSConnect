export type TaxpayerType =
  | 'individual'
  | 'huf'
  | 'aopBoi'
  | 'firm'
  | 'domesticCompany'
  | 'foreignCompany'
  | 'cooperative'
  | 'localAuthority';

export type TaxpayerOption = {
  id: TaxpayerType;
  title: string;
  shortLabel: string;
};

/** Matches categories on incometaxindia.gov.in income tax calculator */
export const TAXPAYER_OPTIONS: TaxpayerOption[] = [
  { id: 'individual', title: 'Individual', shortLabel: 'Individual' },
  { id: 'huf', title: 'HUF', shortLabel: 'HUF' },
  { id: 'aopBoi', title: 'AOPs / BOI', shortLabel: 'AOP/BOI' },
  { id: 'firm', title: 'Firm / LLP', shortLabel: 'Firm/LLP' },
  { id: 'domesticCompany', title: 'Domestic company', shortLabel: 'Dom. co.' },
  { id: 'foreignCompany', title: 'Foreign company', shortLabel: 'Foreign co.' },
  { id: 'cooperative', title: 'Co-operative society', shortLabel: 'Co-op' },
  { id: 'localAuthority', title: 'Local authority', shortLabel: 'Local auth.' },
];

export type DomesticCompanyRate = '30' | '25' | '22' | '15';

export const DOMESTIC_COMPANY_RATE_OPTIONS: {
  id: DomesticCompanyRate;
  label: string;
  rate: number;
  note: string;
}[] = [
  { id: '30', label: '30%', rate: 0.3, note: 'Default domestic company rate' },
  {
    id: '25',
    label: '25%',
    rate: 0.25,
    note: 'Turnover ≤ ₹400 cr (FY 2023-24) or Section 115BA',
  },
  { id: '22', label: '22%', rate: 0.22, note: 'Section 115BAA (optional)' },
  { id: '15', label: '15%', rate: 0.15, note: 'Section 115BAB – new manufacturing' },
];
