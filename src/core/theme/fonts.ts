import { Platform } from 'react-native';

/**
 * Inter 18pt static fonts in `src/assets/fonts` (e.g. `Inter_18pt-Regular.ttf`).
 *
 * Android registers custom fonts by **file name without .ttf** → `Inter_18pt-Regular`.
 * iOS uses the font’s **PostScript name** (name ID 6 in the TTF) → `Inter18pt-Regular`
 * (note: no underscore between "Inter" and "18pt").
 *
 * Using the wrong string (e.g. `Inter-Regular`) means React Native silently falls back
 * to the system font.
 */
const inter18Android = {
  regular: 'Inter_18pt-Regular',
  medium: 'Inter_18pt-Medium',
  semiBold: 'Inter_18pt-SemiBold',
  bold: 'Inter_18pt-Bold',
} as const;

const inter18IosPostScript = {
  regular: 'Inter18pt-Regular',
  medium: 'Inter18pt-Medium',
  semiBold: 'Inter18pt-SemiBold',
  bold: 'Inter18pt-Bold',
} as const;

export type Inter18Weight = keyof typeof inter18Android;

/** Resolved `fontFamily` for the current platform. */
export function inter18Family(weight: Inter18Weight = 'regular'): string {
  return Platform.OS === 'ios'
    ? inter18IosPostScript[weight]
    : inter18Android[weight];
}

/** @deprecated Prefer `inter18Family()` — kept for shorthand imports. */
export const Fonts = {
  get regular() {
    return inter18Family('regular');
  },
  get medium() {
    return inter18Family('medium');
  },
  get semibold() {
    return inter18Family('semiBold');
  },
  get bold() {
    return inter18Family('bold');
  },
};
