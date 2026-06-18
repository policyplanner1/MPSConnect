export type CkycRequest = {
  docNumber: string;
  dob: string;
  userPhone: string;
  fromDate: string;
  toDate: string;
};

export type CkycResponseData = {
  title: string | null;
  ckycNumber: string | null;
  fullName: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  dob: string | null;
  gender: string | null;
  age: string | null;
  address1: string | null;
  address2: string | null;
  pincode: string | null;
  state: string | null;
  city: string | null;
  area: string | null;
  docNumber: string | null;
  company_id: number | null;
  plan_id: number | null;
  UUID: string | null;
  errMsg: string | null;
  errCode: string | null;
  ckycStatus: string | null;
};

export type CkycApiResponse = {
  status: string;
  message: string;
  UUID: string;
  quote_no: string;
  userPhone: string;
  user_id: number;
  ckycResponse: CkycResponseData;
};

export type TravelInsuranceSession = {
  uuid: string;
  quoteNo: string;
  userPhone: string;
  userId: number;
  companyId: string;
  planId: string;
  ckyc: CkycResponseData;
  fromDate: string;
  toDate: string;
  pan: string;
  dobApi: string;
  mobile: string;
};

export type VerifyFormData = {
  title: string;
  gender: string;
  firstName: string;
  middleName: string;
  lastName: string;
  pan: string;
  dob: string;
  mobile: string;
  email: string;
  maritalStatus: string;
  nomineeName: string;
  fromDate: string;
  toDate: string;
  building: string;
  streetName: string;
  city: string;
  pincode: string;
  state: string;
};

export type ProposalRequest = {
  UUID: string;
  building: string;
  city: string;
  company_id: string;
  dob: string;
  docNumber: string;
  email: string;
  firstName: string;
  fromDate: string;
  gender: string;
  lastName: string;
  maritalstatus: string;
  middleName: string;
  nomineename: string;
  pincode: string;
  plan_id: string;
  quote_no: string;
  state: string;
  streetname: string;
  title: string;
  toDate: string;
  userPhone: string;
  telephone?: string;
  user_id: string;
};

export type ProposalPolicyDetails = {
  travelplan: string;
  areaplan: string;
  finalPremium: string;
  fromDate: string;
  toDate: string;
  loading: string;
  returnpath: string;
};

export type ProposalApiResponse = {
  message: string;
  proposalResponse: {
    pTrvPartnerDtls_inout: Record<string, string | null> | null;
    pTrvPolDtls_inout: (ProposalPolicyDetails & Record<string, string | null>) | null;
    pError_out: {
      errNumber: string | null;
      errText: string | null;
    } | null;
    pErrorCode_out: string | null;
  } | null;
};

export type PlanCoverDetail = {
  pbenefits: string;
  pdeductible: string | null;
  plimits: string;
};

export type PlanDetailsApiResponse = {
  message: string;
  data: {
    pTrvPlanDtlsList_out: Array<{
      planname: string;
      areaname: string;
      minDaysFrom: string;
      maxDaysTo: string;
    }>;
    pTrvCoverDtlsList_out: PlanCoverDetail[];
  };
};

export type TravelInsurancePlanSummary = {
  planName: string;
  areaName: string;
  finalPremium: string;
  fromDate: string;
  toDate: string;
  paymentUrl: string;
  covers: PlanCoverDetail[];
};
