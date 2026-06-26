export type ExploreServiceAction = 'healthInsurance';

export type ExploreServiceIconKey =
  | 'itrFiling'
  | 'propertyTaxNameCertificate'
  | 'incomeTaxReply'
  | 'aadhar'
  | 'pan'
  | 'voterId'
  | 'passport'
  | 'rationCard'
  | 'twoWheelLicense'
  | 'twoFourWheelLicense'
  | 'seniorCitizenCertificate'
  | 'birthCertificate'
  | 'deathCertificate'
  | 'marriageCertificate'
  | 'domicileCertificate'
  | 'casteCertificate'
  | 'incomeCertificate'
  | 'drivingLicence'
  | 'rentAgreement';

export type ExploreServiceItem = {
  id: string;
  title: string;
  description: string;
  emoji?: string;
  iconKey?: ExploreServiceIconKey;
  priceLabel?: string;
  tag?: string;
  ctaLabel?: string;
  /** When set, Explore routes this card to a native module instead of a generic handler. */
  action?: ExploreServiceAction;
};

export const EXPLORE_HEALTH_INSURANCE_SERVICE_ID = 'ins-1';

export function isExploreHealthInsuranceService(service: ExploreServiceItem): boolean {
  return (
    service.action === 'healthInsurance' || service.id === EXPLORE_HEALTH_INSURANCE_SERVICE_ID
  );
}

export type ExploreCategory = {
  id: string;
  title: string;
  layout: 'horizontal' | 'grid';
  services: ExploreServiceItem[];
};

export const EXPLORE_USER = {
  name: 'Kiran',
  initials: 'K',
  location: 'Pune, Maharashtra, India',
};

export const TAX_SEASON_ESSENTIALS: ExploreCategory = {
  id: 'tax-season',
  title: 'Tax Season Essentials',
  layout: 'horizontal',
  services: [
    {
      id: 'tax-season-itr',
      title: 'ITR Filing',
      description: 'Get your ITR filed by experts quickly and accurately.',
      iconKey: 'itrFiling',
      priceLabel: '₹499',
      ctaLabel: 'Apply now',
    },
    {
      id: 'tax-season-property-tax',
      title: 'Property Tax Name Certificate',
      description: 'Update property tax records with the correct owner name.',
      iconKey: 'propertyTaxNameCertificate',
      priceLabel: '₹699',
      ctaLabel: 'Apply now',
    },
    {
      id: 'tax-season-itr-reply',
      title: 'Reply to Income Tax Notice',
      description: 'Expert help to respond to income tax notices on time.',
      iconKey: 'incomeTaxReply',
      priceLabel: '₹999',
      ctaLabel: 'Apply now',
    },
  ],
};

export const IDENTITY_DOCUMENTS: ExploreCategory = {
  id: 'identity',
  title: 'Identity Documents',
  layout: 'horizontal',
  services: [
    {
      id: 'identity-aadhar',
      title: 'Aadhaar Card Services',
      description: 'New, update, or duplicate Aadhaar assistance.',
      iconKey: 'aadhar',
      priceLabel: '₹299',
      ctaLabel: 'Apply now',
    },
    {
      id: 'identity-pan',
      title: 'PAN Card Services',
      description: 'Apply for a new PAN or correct existing details.',
      iconKey: 'pan',
      priceLabel: '₹499',
      ctaLabel: 'Apply now',
    },
    {
      id: 'identity-voter',
      title: 'Voter ID Card Services',
      description: 'New voter ID application and correction support.',
      iconKey: 'voterId',
      priceLabel: '₹399',
      ctaLabel: 'Apply now',
    },
    {
      id: 'identity-passport',
      title: 'Passport Services',
      description: 'Passport application and renewal made simple.',
      iconKey: 'passport',
      priceLabel: '₹999',
      ctaLabel: 'Apply now',
    },
    {
      id: 'identity-ration',
      title: 'Ration Card Services',
      description: 'Apply for a new ration card or update details.',
      iconKey: 'rationCard',
      priceLabel: '₹349',
      ctaLabel: 'Apply now',
    },
    {
      id: 'identity-two-wheel',
      title: 'Two-Wheel License',
      description: 'Learner and permanent two-wheeler licence help.',
      iconKey: 'twoWheelLicense',
      priceLabel: '₹599',
      ctaLabel: 'Apply now',
    },
    {
      id: 'identity-two-four-wheel',
      title: 'Two & Four Wheeler License',
      description: 'Driving licence services for bikes and cars.',
      iconKey: 'twoFourWheelLicense',
      priceLabel: '₹799',
      ctaLabel: 'Apply now',
    },
    {
      id: 'identity-senior',
      title: 'Senior Citizen Certificate',
      description: 'Official senior citizen certificate application help.',
      iconKey: 'seniorCitizenCertificate',
      priceLabel: '₹449',
      ctaLabel: 'Apply now',
    },
  ],
};

export const CERTIFICATES: ExploreCategory = {
  id: 'certificates',
  title: 'Certificates',
  layout: 'horizontal',
  services: [
    {
      id: 'cert-birth',
      title: 'Birth Certificate',
      description: 'Apply for a new or duplicate birth certificate.',
      iconKey: 'birthCertificate',
      priceLabel: '₹399',
      ctaLabel: 'Apply now',
    },
    {
      id: 'cert-death',
      title: 'Death Certificate',
      description: 'Get a death certificate issued without hassle.',
      iconKey: 'deathCertificate',
      priceLabel: '₹399',
      ctaLabel: 'Apply now',
    },
    {
      id: 'cert-marriage',
      title: 'Marriage Certificate',
      description: 'Register your marriage and obtain the certificate.',
      iconKey: 'marriageCertificate',
      priceLabel: '₹699',
      ctaLabel: 'Apply now',
    },
    {
      id: 'cert-domicile',
      title: 'Domicile Certificate',
      description: 'Proof of residence for government applications.',
      iconKey: 'domicileCertificate',
      priceLabel: '₹499',
      ctaLabel: 'Apply now',
    },
    {
      id: 'cert-caste',
      title: 'Caste Certificate',
      description: 'State-issued caste certificate application support.',
      iconKey: 'casteCertificate',
      priceLabel: '₹449',
      ctaLabel: 'Apply now',
    },
    {
      id: 'cert-income',
      title: 'Income Certificate',
      description: 'Official income proof for schemes and loans.',
      iconKey: 'incomeCertificate',
      priceLabel: '₹399',
      ctaLabel: 'Apply now',
    },
  ],
};

export const LIMITED_OFFER_SERVICES: ExploreServiceItem[] = [
  {
    id: 'limited-itr',
    title: 'ITR Filing',
    description: 'Limited-time expert ITR filing at a special price.',
    iconKey: 'itrFiling',
    priceLabel: '₹499',
    ctaLabel: 'Apply now',
  },
  {
    id: 'limited-driving',
    title: 'Driving Licence',
    description: 'Fast-track learner and permanent licence assistance.',
    iconKey: 'drivingLicence',
    priceLabel: '₹799',
    ctaLabel: 'Apply now',
  },
  {
    id: 'limited-rent',
    title: 'Rent Agreement',
    description: 'Create a legally valid rent agreement online.',
    iconKey: 'rentAgreement',
    priceLabel: '₹599',
    ctaLabel: 'Apply now',
  },
];

/** @deprecated Use LIMITED_OFFER_SERVICES */
export const LIMITED_OFFER_SERVICE = LIMITED_OFFER_SERVICES[0];
