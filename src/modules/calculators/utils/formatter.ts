/**
 * Indian digit grouping without `Intl` (Hermes / some Android builds lack full ICU).
 */
export function formatIndianInteger(n: number): string {
  if (!Number.isFinite(n)) {
    return '0';
  }
  const negative = n < 0;
  const s = String(Math.abs(Math.round(n)));
  if (s.length <= 3) {
    return (negative ? '-' : '') + s;
  }
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const groups: string[] = [];
  while (rest.length > 0) {
    groups.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  return (negative ? '-' : '') + groups.join(',') + ',' + last3;
}

export function formatInr(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '—';
  }
  return formatIndianInteger(Math.round(amount));
}

export function formatInrDecimals(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '—';
  }
  const fixed = amount.toFixed(2);
  const sign = amount < 0 ? '-' : '';
  const absFixed = fixed.replace(/^-/, '');
  const [intPart, dec] = absFixed.split('.');
  const intNum = parseInt(intPart, 10);
  return sign + formatIndianInteger(intNum) + '.' + (dec ?? '00');
}

export function parseAmount(raw: string): number {
  const n = parseFloat(raw.replace(/[₹,\s]/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}
