import { useEffect, useState } from 'react';

import { EnquiryFormData } from '../navigation/HealthInsuranceStack';

const PLANS_LIST_URL =
  'https://policyplanner.com/health-insurance/companies/plans?policy=health';

const LOGO_BASE = 'https://policyplanner.com/assets/logos/';

const COVER_MAP: Record<string, number> = {
  '₹50 Thousand': 50000,
  '₹75 Thousand': 75000,
  '₹5 Lakh': 500000,
  '₹7 Lakh': 700000,
  '₹10 Lakh': 1000000,
  '₹15 Lakh': 1500000,
  '₹20 Lakh': 2000000,
  '₹25 Lakh': 2500000,
  '₹30 Lakh': 3000000,
  '₹35 Lakh': 3500000,
  '₹40 Lakh': 4000000,
  '₹45 Lakh': 4500000,
  '₹50 Lakh': 5000000,
  '₹75 Lakh': 7500000,
  '₹1 Crore': 10000000,
  '₹2 Crores': 20000000,
  '₹3 Crores': 30000000,
  '₹4 Crores': 40000000,
  '₹5 Crores': 50000000,
};

export type PlanFeature = {
  id: number;
  includes: string | null;
  excludes: string | null;
  addons: string | null;
};

export type QuotePlan = {
  companyId: string;
  planId: string;
  planName: string;
  coverAmount: number;
  totalPayablePremium: number;
  totalDiscount: number;
  noOfAdults: number;
  noOfChildren: number;
  company: {
    company_id: number;
    company_name: string;
    logo: string;
  };
  plan: {
    plan_name: string;
    broucher: string;
    onePager: string;
    api_type: string;
  };
  features: PlanFeature[];
};

function buildPayload(formData: EnquiryFormData): Record<string, number | string | null> {
  const coverAmount = COVER_MAP[formData.coverAmount] ?? 500000;
  const childAges = formData.childrenAges.map(a => (Number(a) > 0 ? Number(a) : null));
  return {
    coverAmount,
    zone: '1',
    age: formData.includeSelf && formData.selfAge ? Number(formData.selfAge) : null,
    sage: formData.includeSpouse && formData.spouseAge ? Number(formData.spouseAge) : null,
    c1age: childAges[0] ?? null,
    c2age: childAges[1] ?? null,
    c3age: childAges[2] ?? null,
    c4age: childAges[3] ?? null,
  };
}

export function getLogoUri(logo: string): string {
  return `${LOGO_BASE}${logo}`;
}

export function useHealthQuotes(formData: EnquiryFormData) {
  const [plans, setPlans] = useState<QuotePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setPlans([]);
      setLoadedCount(0);
      setTotalCount(0);
      setError(null);

      try {
        const listRes = await fetch(PLANS_LIST_URL);
        if (!listRes.ok) throw new Error('Failed to fetch plan list');
        const listData = await listRes.json();

        if (!listData.success) throw new Error('Plan list unavailable');

        const apiUrls: string[] = listData.data.map(
          (d: { api_type: string }) => d.api_type,
        );
        if (!cancelled) setTotalCount(apiUrls.length);

        const payload = buildPayload(formData);

        await Promise.allSettled(
          apiUrls.map(url =>
            fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
              .then(r => r.json())
              .then((data: QuotePlan) => {
                if (cancelled) return;
                if (data?.totalPayablePremium && data.company) {
                  setPlans(prev => [...prev, data]);
                }
                setLoadedCount(prev => prev + 1);
              })
              .catch(() => {
                if (!cancelled) setLoadedCount(prev => prev + 1);
              }),
          ),
        );

        if (!cancelled) setLoading(false);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Something went wrong');
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { plans, loading, loadedCount, totalCount, error };
}
