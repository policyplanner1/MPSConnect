import type {
  CompareGranularity,
  MonthYear,
  QuarterPeriod,
  SavingsEntry,
  SavingsRecurrence,
} from '../types/savings';
import { SAVINGS_CATEGORIES } from '../constants/savingsCategories';

export function createSavingsId(): string {
  return `sav_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Whether `entry` contributes its old/new amounts to calendar month (m, y). */
export function entryContributesToMonth(
  entry: SavingsEntry,
  viewMonth: number,
  viewYear: number,
): boolean {
  const { month: m0, year: y0, recurrence } = entry;
  if (recurrence === 'oneTime') {
    return m0 === viewMonth && y0 === viewYear;
  }
  if (recurrence === 'monthly') {
    if (viewYear > y0) {
      return true;
    }
    if (viewYear === y0) {
      return viewMonth >= m0;
    }
    return false;
  }
  if (recurrence === 'yearly') {
    return viewMonth === m0 && viewYear >= y0;
  }
  return false;
}

export type MonthTotals = {
  oldSpend: number;
  newSpend: number;
  totalSaved: number;
  savingRatePct: number;
};

export function aggregateMonth(
  entries: SavingsEntry[],
  month: number,
  year: number,
): MonthTotals {
  let oldSpend = 0;
  let newSpend = 0;
  for (const e of entries) {
    if (entryContributesToMonth(e, month, year)) {
      oldSpend += e.oldCost;
      newSpend += e.newCost;
    }
  }
  const totalSaved = Math.max(0, oldSpend - newSpend);
  const savingRatePct =
    oldSpend > 0 ? Math.round((totalSaved / oldSpend) * 1000) / 10 : 0;
  return { oldSpend, newSpend, totalSaved, savingRatePct };
}

export function aggregateYear(entries: SavingsEntry[], year: number): MonthTotals {
  let oldSpend = 0;
  let newSpend = 0;
  for (let m = 1; m <= 12; m += 1) {
    const t = aggregateMonth(entries, m, year);
    oldSpend += t.oldSpend;
    newSpend += t.newSpend;
  }
  const totalSaved = Math.max(0, oldSpend - newSpend);
  const savingRatePct =
    oldSpend > 0 ? Math.round((totalSaved / oldSpend) * 1000) / 10 : 0;
  return { oldSpend, newSpend, totalSaved, savingRatePct };
}

export function quarterToMonths(q: 1 | 2 | 3 | 4): [number, number, number] {
  if (q === 1) {
    return [1, 2, 3];
  }
  if (q === 2) {
    return [4, 5, 6];
  }
  if (q === 3) {
    return [7, 8, 9];
  }
  return [10, 11, 12];
}

export function aggregateQuarter(
  entries: SavingsEntry[],
  year: number,
  quarter: 1 | 2 | 3 | 4,
): MonthTotals {
  let oldSpend = 0;
  let newSpend = 0;
  for (const m of quarterToMonths(quarter)) {
    const t = aggregateMonth(entries, m, year);
    oldSpend += t.oldSpend;
    newSpend += t.newSpend;
  }
  const totalSaved = Math.max(0, oldSpend - newSpend);
  const savingRatePct =
    oldSpend > 0 ? Math.round((totalSaved / oldSpend) * 1000) / 10 : 0;
  return { oldSpend, newSpend, totalSaved, savingRatePct };
}

export type CategoryBreakdown = {
  categoryId: string;
  oldSpend: number;
  newSpend: number;
  saved: number;
  pctSaved: number;
};

export function aggregateByCategory(
  entries: SavingsEntry[],
  month: number,
  year: number,
): CategoryBreakdown[] {
  const map = new Map<string, { old: number; new: number }>();
  for (const e of entries) {
    if (!entryContributesToMonth(e, month, year)) {
      continue;
    }
    const cur = map.get(e.categoryId) ?? { old: 0, new: 0 };
    cur.old += e.oldCost;
    cur.new += e.newCost;
    map.set(e.categoryId, cur);
  }
  const out: CategoryBreakdown[] = [];
  for (const [categoryId, v] of map) {
    const saved = Math.max(0, v.old - v.new);
    const pctSaved = v.old > 0 ? Math.round(((v.old - v.new) / v.old) * 1000) / 10 : 0;
    out.push({
      categoryId,
      oldSpend: v.old,
      newSpend: v.new,
      saved,
      pctSaved,
    });
  }
  out.sort((a, b) => b.saved - a.saved);
  return out;
}

export function aggregateByCategoryQuarter(
  entries: SavingsEntry[],
  year: number,
  quarter: 1 | 2 | 3 | 4,
): CategoryBreakdown[] {
  const map = new Map<string, { old: number; new: number }>();
  for (const m of quarterToMonths(quarter)) {
    for (const e of entries) {
      if (!entryContributesToMonth(e, m, year)) {
        continue;
      }
      const cur = map.get(e.categoryId) ?? { old: 0, new: 0 };
      cur.old += e.oldCost;
      cur.new += e.newCost;
      map.set(e.categoryId, cur);
    }
  }
  const out: CategoryBreakdown[] = [];
  for (const [categoryId, v] of map) {
    const saved = Math.max(0, v.old - v.new);
    const pctSaved = v.old > 0 ? Math.round(((v.old - v.new) / v.old) * 1000) / 10 : 0;
    out.push({ categoryId, oldSpend: v.old, newSpend: v.new, saved, pctSaved });
  }
  out.sort((a, b) => b.saved - a.saved);
  return out;
}

export function aggregateByCategoryYear(
  entries: SavingsEntry[],
  year: number,
): CategoryBreakdown[] {
  const map = new Map<string, { old: number; new: number }>();
  for (let m = 1; m <= 12; m += 1) {
    for (const e of entries) {
      if (!entryContributesToMonth(e, m, year)) {
        continue;
      }
      const cur = map.get(e.categoryId) ?? { old: 0, new: 0 };
      cur.old += e.oldCost;
      cur.new += e.newCost;
      map.set(e.categoryId, cur);
    }
  }
  const out: CategoryBreakdown[] = [];
  for (const [categoryId, v] of map) {
    const saved = Math.max(0, v.old - v.new);
    const pctSaved = v.old > 0 ? Math.round(((v.old - v.new) / v.old) * 1000) / 10 : 0;
    out.push({ categoryId, oldSpend: v.old, newSpend: v.new, saved, pctSaved });
  }
  out.sort((a, b) => b.saved - a.saved);
  return out;
}

export function comparePeriods(
  entries: SavingsEntry[],
  granularity: CompareGranularity,
  a: MonthYear | QuarterPeriod | { year: number },
  b: MonthYear | QuarterPeriod | { year: number },
): { a: CategoryBreakdown[]; b: CategoryBreakdown[]; unionKeys: string[] } {
  let listA: CategoryBreakdown[];
  let listB: CategoryBreakdown[];

  if (granularity === 'monthly') {
    const ma = a as MonthYear;
    const mb = b as MonthYear;
    listA = aggregateByCategory(entries, ma.month, ma.year);
    listB = aggregateByCategory(entries, mb.month, mb.year);
  } else if (granularity === 'quarterly') {
    const qa = a as QuarterPeriod;
    const qb = b as QuarterPeriod;
    listA = aggregateByCategoryQuarter(entries, qa.year, qa.quarter);
    listB = aggregateByCategoryQuarter(entries, qb.year, qb.quarter);
  } else {
    const ya = (a as { year: number }).year;
    const yb = (b as { year: number }).year;
    listA = aggregateByCategoryYear(entries, ya);
    listB = aggregateByCategoryYear(entries, yb);
  }

  const keys = new Set<string>();
  listA.forEach(x => keys.add(x.categoryId));
  listB.forEach(x => keys.add(x.categoryId));
  SAVINGS_CATEGORIES.forEach(c => keys.add(c.id));

  return { a: listA, b: listB, unionKeys: [...keys].filter(k => {
    const ca = listA.find(x => x.categoryId === k);
    const cb = listB.find(x => x.categoryId === k);
    return (ca && (ca.oldSpend > 0 || ca.newSpend > 0)) || (cb && (cb.oldSpend > 0 || cb.newSpend > 0));
  }) };
}

export function buildCompareInsight(
  breakdownB: CategoryBreakdown[],
): { line: string; bestPctName: string; bestAbsName: string } {
  const valid = breakdownB.filter(r => r.oldSpend > 0);
  if (valid.length === 0) {
    return {
      line: 'Add entries for the selected period to see insights.',
      bestPctName: '',
      bestAbsName: '',
    };
  }
  let bestPct = valid[0];
  let bestAbs = valid[0];
  for (const row of valid) {
    if (row.pctSaved > bestPct.pctSaved) {
      bestPct = row;
    }
    if (row.saved > bestAbs.saved) {
      bestAbs = row;
    }
  }
  const pctCat = SAVINGS_CATEGORIES.find(c => c.id === bestPct.categoryId)?.name ?? 'A category';
  const absCat = SAVINGS_CATEGORIES.find(c => c.id === bestAbs.categoryId)?.name ?? 'A category';
  const line =
    bestPct.categoryId === bestAbs.categoryId
      ? `${pctCat} led both your biggest percentage cut (${bestPct.pctSaved.toFixed(0)}%) and the largest rupee savings.`
      : `${pctCat} had your highest saving rate (${bestPct.pctSaved.toFixed(0)}%). ${absCat} saved the most in absolute terms (₹${Math.round(bestAbs.saved).toLocaleString('en-IN')}).`;
  return { line, bestPctName: pctCat, bestAbsName: absCat };
}

export function prevMonth(month: number, year: number): MonthYear {
  if (month <= 1) {
    return { month: 12, year: year - 1 };
  }
  return { month: month - 1, year };
}

export function pctChangeVsPrev(current: number, previous: number): number | null {
  if (previous <= 0) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function monthLabel(my: MonthYear): string {
  const d = new Date(my.year, my.month - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export function quarterLabel(q: QuarterPeriod): string {
  return `Q${q.quarter} ${q.year}`;
}
