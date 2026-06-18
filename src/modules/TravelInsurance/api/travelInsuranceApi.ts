import type {
  CkycApiResponse,
  CkycRequest,
  PlanDetailsApiResponse,
  ProposalApiResponse,
  ProposalRequest,
} from '../types/travelInsurance.types';

const CKYC_URL = 'https://policyplanner.com/travel-insurance/ckyc/bajaj';
const PROPOSAL_URL = 'https://policyplanner.com/travel-insurance/proposal/bajaj';
const PLAN_DETAILS_URL =
  'https://policyplanner.com/travel-insurance/proposal/plan-details';

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    throw new Error('Empty response from server.');
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Unexpected response from server.');
  }
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export async function submitTravelCkyc(payload: CkycRequest): Promise<CkycApiResponse> {
  const response = await fetch(CKYC_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await readJson<CkycApiResponse & { error?: string; message?: string }>(response);

  if (!response.ok) {
    throw new Error(data.message ?? data.error ?? 'CKYC verification failed.');
  }

  if (data.status !== 'success') {
    throw new Error(data.message ?? 'CKYC verification failed.');
  }

  return data;
}

export async function submitTravelProposal(
  payload: ProposalRequest,
): Promise<ProposalApiResponse> {
  const response = await fetch(PROPOSAL_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await readJson<ProposalApiResponse & { error?: string; message?: string }>(response);

  if (!response.ok) {
    throw new Error(data.message ?? data.error ?? 'Proposal submission failed.');
  }

  const proposal = data.proposalResponse;
  const errorText = proposal?.pError_out?.errText?.trim();
  const errorCode = proposal?.pErrorCode_out;
  if (errorText && (errorCode == null || String(errorCode) !== '0')) {
    throw new Error(errorText);
  }

  if (!proposal?.pTrvPolDtls_inout?.travelplan) {
    throw new Error(errorText || data.message || 'Proposal did not return plan details.');
  }

  return data;
}

export async function fetchTravelPlanDetails(planName: string): Promise<PlanDetailsApiResponse> {
  const url = `${PLAN_DETAILS_URL}?planname=${encodeURIComponent(planName)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await readJson<PlanDetailsApiResponse & { error?: string; message?: string }>(
    response,
  );

  if (!response.ok) {
    throw new Error(data.message ?? data.error ?? 'Failed to fetch plan details.');
  }

  return data;
}

export function getTravelInsuranceErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback);
}
