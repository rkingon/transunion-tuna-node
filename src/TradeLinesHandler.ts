import { rate } from './lib/rate'

export interface TransunionTradeLine {
	subscriber: {
		industryCode: string
		memberCode: string
		name: {
			unparsed: string
		}
	}
	portfolioType: 'installment' | 'mortgage' | 'revolving' | 'open' | 'lineOfCredit'
	accountNumber: string
	ECOADesignator: 'individual' | 'jointContractLiability' | 'participant'
	dateOpened: string
	dateEffective: string
	dateClosed?: string
	closedIndicator: string
	currentBalance?: string
	highCredit: string
	accountRating: string
	remark: {
		code: string
		type: string
	}
	terms?: {
		paymentFrequency?: 'monthly'
		paymentScheduleMonthCount?: string
		scheduledMonthlyPayment?: string
	}
	account: { type: string }
	pastDue: string
	paymentHistory: any
	mostRecentPayment: { date: string }
	updateMethod: string
}

export interface ParsedTradeLine
	extends Pick<TransunionTradeLine, 'dateOpened' | 'dateEffective' | 'dateClosed' | 'currentBalance'> {
	estimatedInterestRate?: string
	monthlyPayment?: string
	openingBalance: string
	termLengthMonths?: string
	subscriberName: TransunionTradeLine['subscriber']['name']['unparsed']
	type: TransunionTradeLine['account']['type']
}

export interface TradeLinesHandlerResponse {
	tradeLines?: ParsedTradeLine[]
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
		termLengthMonths: undefined
	}
	if (tuCreditLine.terms) {
		tradeLine.monthlyPayment = tuCreditLine.terms.scheduledMonthlyPayment
		if (
			tuCreditLine.terms.paymentScheduleMonthCount &&
			isNaN(+tuCreditLine.terms.paymentScheduleMonthCount) === false
		) {
			tradeLine.termLengthMonths = tuCreditLine.terms.paymentScheduleMonthCount
		}
		if (tradeLine.termLengthMonths && tradeLine.monthlyPayment && tradeLine.openingBalance) {
			const estimatedInterestRate = rate(
				+tradeLine.termLengthMonths,
				+tradeLine.monthlyPayment,
				+tradeLine.openingBalance
			)
			if (
				estimatedInterestRate &&
				isNaN(+estimatedInterestRate) === false &&
				+estimatedInterestRate > 0 &&
				+estimatedInterestRate < 1
			) {
				tradeLine.estimatedInterestRate = estimatedInterestRate
			}
		}
	}
	return tradeLine
}

export function tradeLinesHandler(tradeLines?: TransunionTradeLine[]): TradeLinesHandlerResponse {
	if (tradeLines?.length) {
		return {
			tradeLines: tradeLines.map((tradeLine) => parseTradeLine(tradeLine))
		}
	}
	return {
		tradeLines: []
	}
}
