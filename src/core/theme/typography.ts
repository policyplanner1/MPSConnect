import { TextStyle } from 'react-native';
import { inter18Family, type Inter18Weight } from './fonts';

/**
 * Inter 18pt for UI text. Uses `fonts.ts` so Android/iOS get the correct `fontFamily`
 * string (they differ for these Google static Inter builds).
 *
 * Do not add `fontWeight` here when using explicit per-weight files — especially on
 * Android it can break custom font selection.
 */
export function inter18(weight: Inter18Weight = 'regular'): TextStyle {
  return { fontFamily: inter18Family(weight) };
}

export type { Inter18Weight };
