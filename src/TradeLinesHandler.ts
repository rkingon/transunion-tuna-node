import { rate } from './lib/rate';

export interface TransunionTradeLine {
  subscriber: {
    industryCode: string;
    memberCode: string;
    name: {
      unparsed: string;
    };
  };
  portfolioType:
    | 'installment'
    | 'mortgage'
    | 'revolving'
    | 'open'
    | 'lineOfCredit';
  accountNumber: string;
  ECOADesignator: 'individual' | 'jointContractLiability' | 'participant';
  dateOpened: string;
  dateEffective: string;
  dateClosed?: string;
  closedIndicator: string;
  currentBalance?: number;
  highCredit: number;
  accountRating: number;
  remark: {
    code: string;
    type: string;
  };
  terms?: {
    paymentFrequency?: 'monthly';
    paymentScheduleMonthCount?: number;
    scheduledMonthlyPayment?: number;
  };
  account: { type: string };
  pastDue: number;
  paymentHistory: any;
  mostRecentPayment: { date: string };
  updateMethod: string;
}

export interface ParsedTradeLine
  extends Pick<
    TransunionTradeLine,
    'dateOpened' | 'dateEffective' | 'dateClosed' | 'currentBalance'
  > {
  estimatedInterestRate?: number;
  monthlyPayment?: number;
  openingBalance: number;
  termLengthMonths?: number;
  subscriberName: TransunionTradeLine['subscriber']['name']['unparsed'];
  type: TransunionTradeLine['account']['type'];
}

export interface TradeLinesHandlerResponse {
  tradeLines?: ParsedTradeLine[];
}

const parseTradeLine = (tuCreditLine: TransunionTradeLine): ParsedTradeLine => {
  const tradeLine: ParsedTradeLine = {
    type: tuCreditLine.account.type,
    subscriberName: tuCreditLine.subscriber.name.unparsed,
    dateOpened: tuCreditLine.dateOpened,
    dateEffective: tuCreditLine.dateEffective,
    dateClosed: tuCreditLine.dateClosed,
    openingBalance: tuCreditLine.highCredit,
    currentBalance: tuCreditLine.currentBalance,
    estimatedInterestRate: undefined,
    monthlyPayment: undefined,
    termLengthMonths: undefined,
  };
  if (tuCreditLine.terms) {
    if (
      tuCreditLine.terms.paymentScheduleMonthCount &&
      tuCreditLine.terms.scheduledMonthlyPayment &&
      tuCreditLine.highCredit
    ) {
      const estimatedInterestRate = rate(
        tuCreditLine.terms.paymentScheduleMonthCount,
        tuCreditLine.terms.scheduledMonthlyPayment,
        tuCreditLine.highCredit
      );
      tradeLine.estimatedInterestRate = +estimatedInterestRate;
    }
    tradeLine.monthlyPayment = tuCreditLine.terms.scheduledMonthlyPayment;
    if (typeof tuCreditLine.terms.paymentScheduleMonthCount === 'number') {
      tradeLine.termLengthMonths = tuCreditLine.terms.paymentScheduleMonthCount;
    }
  }
  return tradeLine;
};

export function tradeLinesHandler(
  tradeLines?: TransunionTradeLine[]
): TradeLinesHandlerResponse {
  if (tradeLines?.length) {
    return {
      tradeLines: tradeLines.map(tradeLine => parseTradeLine(tradeLine)),
    };
  }
  return {
    tradeLines: [],
  };
}
