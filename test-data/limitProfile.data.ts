export interface LimitRuleData {
  transactionType: 'OUTGOING';
  limitUnit: 'AMOUNT';
  resetCycle: 'Daily';
  minimumAmount: number;
  maximumAmount: number;
  currency: 'TZS';
}

export interface LimitProfileFlowData {
  createName: string;
  updateName: string;
  description: string;
  createRule: LimitRuleData;
  updateRule: {
    minimumAmount: number;
    maximumAmount: number;
  };
  checkerApproveComment: string;
  checkerRejectComment: string;
  makerRejectComment: string;
}

function uniqueSuffix(): string {
  return `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export function generateLimitProfileFlowData(seed: string): LimitProfileFlowData {
  const suffix = `${seed}_${uniqueSuffix()}`;

  return {
    createName: `Auto_Limit_Profile_${suffix}`,
    updateName: `Auto_Limit_Profile_Upd_${suffix}`,
    description: `Automation limit profile ${suffix}`,
    createRule: {
      transactionType: 'OUTGOING',
      limitUnit: 'AMOUNT',
      resetCycle: 'Daily',
      minimumAmount: 10,
      maximumAmount: 50,
      currency: 'TZS',
    },
    updateRule: {
      minimumAmount: 50,
      maximumAmount: 500,
    },
    checkerApproveComment: `Approved by checker ${suffix}`,
    checkerRejectComment: `Rejected by checker ${suffix}`,
    makerRejectComment: `Rejected by maker ${suffix}`,
  };
}
