export type ExploreServiceAction = 'healthInsurance';

export type ExploreServiceItem = {
  id: string;
  title: string;
  description: string;
  emoji: string;
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

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    id: 'tax',
    title: 'Tax & Finance',
    layout: 'grid',
    services: [
      {
        id: 'tax-1',
        title: 'Income Tax Filing',
        description: 'File your ITR quickly with expert support.',
        emoji: '📊',
        tag: 'POPULAR',
      },
      {
        id: 'tax-2',
        title: 'GST Registration',
        description: 'Register your business for GST compliance.',
        emoji: '🧾',
        tag: 'OFFER',
      },
      {
        id: 'tax-3',
        title: 'TDS Return',
        description: 'Timely TDS filing and compliance help.',
        emoji: '💳',
      },
      {
        id: 'tax-4',
        title: 'Tax Planning',
        description: 'Plan savings with smart tax strategies.',
        emoji: '📈',
      },
    ],
  },
  {
    id: 'certificates',
    title: 'Certificates',
    layout: 'grid',
    services: [
      {
        id: 'cert-1',
        title: 'Birth Certificate',
        description: 'Apply for a new or duplicate certificate.',
        emoji: '📜',
        tag: 'POPULAR',
      },
      {
        id: 'cert-2',
        title: 'Income Certificate',
        description: 'Official income proof for schemes & loans.',
        emoji: '📋',
      },
      {
        id: 'cert-3',
        title: 'Caste Certificate',
        description: 'State-issued caste certificate assistance.',
        emoji: '🪪',
      },
      {
        id: 'cert-4',
        title: 'Domicile Certificate',
        description: 'Proof of residence for government use.',
        emoji: '🏠',
      },
    ],
  },
  {
    id: 'property',
    title: 'Property & Land Services',
    layout: 'horizontal',
    services: [
      {
        id: 'prop-1',
        title: 'Property Registration',
        description: 'Register sale or transfer of property.',
        emoji: '🏡',
        tag: 'OFFER',
      },
      {
        id: 'prop-2',
        title: 'Land Records',
        description: 'Fetch 7/12, property card & maps.',
        emoji: '🗺️',
      },
      {
        id: 'prop-3',
        title: 'Encumbrance Certificate',
        description: 'Verify legal status before you buy.',
        emoji: '🔍',
      },
      {
        id: 'prop-4',
        title: 'Mutation Entry',
        description: 'Update land records after transfer.',
        emoji: '📝',
      },
    ],
  },
  {
    id: 'legal',
    title: 'Legal Services',
    layout: 'grid',
    services: [
      {
        id: 'legal-1',
        title: 'Affidavit',
        description: 'Draft and notarize affidavits online.',
        emoji: '⚖️',
      },
      {
        id: 'legal-2',
        title: 'Rent Agreement',
        description: 'Create a legally valid rent contract.',
        emoji: '📑',
        tag: 'POPULAR',
      },
      {
        id: 'legal-3',
        title: 'Power of Attorney',
        description: 'Authorize someone to act on your behalf.',
        emoji: '✍️',
      },
      {
        id: 'legal-4',
        title: 'Will Drafting',
        description: 'Plan asset distribution with legal help.',
        emoji: '📖',
      },
    ],
  },
  {
    id: 'insurance',
    title: 'Insurance Services',
    layout: 'horizontal',
    services: [
      {
        id: EXPLORE_HEALTH_INSURANCE_SERVICE_ID,
        title: 'Health Insurance',
        description: 'Compare plans and buy in minutes.',
        emoji: '🏥',
        tag: 'OFFER',
        ctaLabel: 'Book Now',
        action: 'healthInsurance',
      },
      {
        id: 'ins-2',
        title: 'Life Insurance',
        description: 'Secure your family’s financial future.',
        emoji: '🛡️',
      },
      {
        id: 'ins-3',
        title: 'Motor Insurance',
        description: 'Renew or buy car & bike insurance.',
        emoji: '🚗',
      },
      {
        id: 'ins-4',
        title: 'Travel Insurance',
        description: 'Coverage for domestic & international trips.',
        emoji: '✈️',
      },
    ],
  },
];

export const LIMITED_OFFER_SERVICE: ExploreServiceItem = {
  id: 'limited-1',
  title: 'Passport Application',
  description: 'Fast-track assistance for new passport requests.',
  emoji: '🛂',
  tag: 'LIMITED',
  ctaLabel: 'Book Now',
};
