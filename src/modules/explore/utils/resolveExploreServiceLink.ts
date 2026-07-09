import { TAX_FILING_CATEGORY_ID } from '../../services/IncomeTax/constants';
import type { Service } from '../../services/types/service.types';
import type { ExploreServiceIconKey, ExploreServiceItem } from '../data/exploreData';

export const GOVERNMENT_DOCUMENTS_CATEGORY_ID = 3;

const TAX_ICON_KEYS = new Set<ExploreServiceIconKey>([
  'itrFiling',
  'propertyTaxNameCertificate',
  'incomeTaxReply',
]);

export type ExploreServiceCatalog = {
  taxServices: Service[];
  govServices: Service[];
};

export type ExploreServiceLink = {
  serviceId: number;
  categoryId: number;
};

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9&]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasTwoWheelTokens(normalized: string): boolean {
  return (
    normalized.includes('2 wheel') ||
    normalized.includes('two wheel') ||
    normalized.includes('two wheeler') ||
    normalized.includes('bike') ||
    normalized.includes('motorbike') ||
    normalized.includes('scooter') ||
    normalized.includes('motorcycle')
  );
}

function hasFourWheelTokens(normalized: string): boolean {
  return (
    normalized.includes('4 wheel') ||
    normalized.includes('four wheel') ||
    normalized.includes('four wheeler') ||
    normalized.includes('automobile') ||
    (normalized.includes('car') && !normalized.includes('card'))
  );
}

function hasCombinedTwoFourTokens(normalized: string): boolean {
  return (
    normalized.includes('two&four') ||
    normalized.includes('two & four') ||
    normalized.includes('2&4') ||
    normalized.includes('2 & 4') ||
    normalized.includes('2 and 4') ||
    normalized.includes('two and four') ||
    (hasTwoWheelTokens(normalized) && hasFourWheelTokens(normalized))
  );
}

function matchesExploreIconKey(
  iconKey: ExploreServiceIconKey,
  normalizedServiceName: string,
): boolean {
  switch (iconKey) {
    case 'itrFiling':
      return (
        (normalizedServiceName.includes('itr') ||
          (normalizedServiceName.includes('income tax') &&
            (normalizedServiceName.includes('fil') || normalizedServiceName.includes('return')))) &&
        !normalizedServiceName.includes('notice') &&
        !normalizedServiceName.includes('reply')
      );
    case 'propertyTaxNameCertificate':
      return normalizedServiceName.includes('property tax');
    case 'incomeTaxReply':
      return (
        normalizedServiceName.includes('income tax') &&
        (normalizedServiceName.includes('notice') || normalizedServiceName.includes('reply'))
      );
    case 'aadhar':
      return (
        normalizedServiceName.includes('aadhaar') ||
        normalizedServiceName.includes('aadhar') ||
        normalizedServiceName.includes('adhar')
      );
    case 'pan':
      return normalizedServiceName.includes('pan');
    case 'voterId':
      return normalizedServiceName.includes('voter');
    case 'passport':
      return normalizedServiceName.includes('passport');
    case 'rationCard':
      return normalizedServiceName.includes('ration');
    case 'twoWheelLicense':
      return hasTwoWheelTokens(normalizedServiceName) && !hasCombinedTwoFourTokens(normalizedServiceName);
    case 'twoFourWheelLicense':
      return hasCombinedTwoFourTokens(normalizedServiceName);
    case 'seniorCitizenCertificate':
      return normalizedServiceName.includes('senior citizen');
    case 'birthCertificate':
      return normalizedServiceName.includes('birth');
    case 'deathCertificate':
      return normalizedServiceName.includes('death');
    case 'marriageCertificate':
      return normalizedServiceName.includes('marriage');
    case 'domicileCertificate':
      return normalizedServiceName.includes('domicile');
    case 'casteCertificate':
      return normalizedServiceName.includes('caste');
    case 'incomeCertificate':
      return (
        normalizedServiceName.includes('income') &&
        normalizedServiceName.includes('certificate') &&
        !normalizedServiceName.includes('tax')
      );
    case 'drivingLicence':
      return (
        normalizedServiceName.includes('driving license') ||
        normalizedServiceName.includes('driving licence') ||
        hasFourWheelTokens(normalizedServiceName)
      );
    case 'rentAgreement':
      return normalizedServiceName.includes('rent');
    default:
      return false;
  }
}

function matchesExploreItem(item: ExploreServiceItem, normalizedServiceName: string): boolean {
  if (item.iconKey) {
    return matchesExploreIconKey(item.iconKey, normalizedServiceName);
  }

  const normalizedTitle = normalizeName(item.title);
  return (
    normalizedServiceName.includes(normalizedTitle) ||
    normalizedTitle.includes(normalizedServiceName)
  );
}

function resolveCategoryId(iconKey?: ExploreServiceIconKey): number {
  if (iconKey && TAX_ICON_KEYS.has(iconKey)) {
    return TAX_FILING_CATEGORY_ID;
  }
  return GOVERNMENT_DOCUMENTS_CATEGORY_ID;
}

export function isExploreTaxService(item: ExploreServiceItem): boolean {
  return !!item.iconKey && TAX_ICON_KEYS.has(item.iconKey);
}

export function resolveExploreServiceLink(
  item: ExploreServiceItem,
  catalog: ExploreServiceCatalog,
): ExploreServiceLink | null {
  const categoryId = resolveCategoryId(item.iconKey);
  const services =
    categoryId === TAX_FILING_CATEGORY_ID ? catalog.taxServices : catalog.govServices;

  const match = services.find(service => matchesExploreItem(item, normalizeName(service.name)));
  if (!match) {
    return null;
  }

  return {
    serviceId: match.id,
    categoryId,
  };
}
