import type {
  VaultDocumentGlyph,
  VaultDocumentPresentation,
  VaultDocumentRecord,
} from '../types/docVault.types';

export function formatVaultDocumentDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function resolveGlyph(title: string): VaultDocumentGlyph {
  const normalized = title.toLowerCase();

  if (normalized.includes('passport')) {
    return 'passport';
  }
  if (normalized.includes('pan')) {
    return 'pan';
  }
  if (
    normalized.includes('aadhaar') ||
    normalized.includes('aadhar') ||
    normalized.includes('adhar')
  ) {
    return 'aadhaar';
  }
  if (normalized.includes('license') || normalized.includes('licence')) {
    return 'license';
  }
  if (normalized.includes('insurance')) {
    return 'insurance';
  }

  return 'generic';
}

const GLYPH_STYLES: Record<
  VaultDocumentGlyph,
  Pick<VaultDocumentPresentation, 'iconBg' | 'iconColor'>
> = {
  passport: { iconBg: '#F3E8FF', iconColor: '#7C3AED' },
  pan: { iconBg: '#FFEDD5', iconColor: '#EA580C' },
  aadhaar: { iconBg: '#DBEAFE', iconColor: '#2563EB' },
  license: { iconBg: '#E0F2FE', iconColor: '#0284C7' },
  insurance: { iconBg: '#DCFCE7', iconColor: '#16A34A' },
  generic: { iconBg: '#EEF2FF', iconColor: '#4F46E5' },
};

export function mapVaultDocumentPresentation(
  document: VaultDocumentRecord,
): VaultDocumentPresentation {
  const glyph = resolveGlyph(document.title);
  const style = GLYPH_STYLES[glyph];

  return {
    glyph,
    iconBg: style.iconBg,
    iconColor: style.iconColor,
  };
}
