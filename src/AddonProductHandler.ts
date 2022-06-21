export interface AddonProduct {
	[x: string]: any
	code: string
	status: string
}

export interface AddonHandlerResponse {
	vantageScore?: string
	creditVision?: {
		autoTradeLineCount?: string
		creditCardBalance?: string
		unsecuredBalance?: string
	}
	autoSummary?: {
		subscriberName: string
		currentBalance: string
		remainingMonths: string
		scheduledMonthlyPayment: string
		late24MonthsReported: string
		estimatedAPR: string
	}[]
}

export interface CreditVisionCharacteristic {
	algorithmID: string
	id: 'AU01S' | 'BC33S' | 'US33S'
	value: string
}

export function addonProductHandler(_addonProducts: AddonProduct | AddonProduct[]): AddonHandlerResponse {
	const response: AddonHandlerResponse = {}
	const addonProducts: AddonProduct[] = [_addonProducts].flat()
	for (const addonProduct of addonProducts) {
		switch (addonProduct?.code) {
			case '00V60': {
				response.vantageScore = addonProduct.scoreModel?.score?.results
				break
			}
			case '00WR3': {
				response.creditVision = {}
				const characteristics: CreditVisionCharacteristic[] = addonProduct.scoreModel?.characteristic || []
				for (const { id, value } of characteristics) {
					switch (id) {
						case 'AU01S': {
							response.creditVision.autoTradeLineCount = value
						}
						case 'BC33S': {
							response.creditVision.creditCardBalance = value
							break
						}
						case 'US33S': {
							response.creditVision.unsecuredBalance = value
						}
					}
				}
				break
			}
			case '07070': {
				const summary = addonProduct.autoCreditSummary?.autoLoanSummary
				if (summary?.length) {
					const autoSummary: AddonHandlerResponse['autoSummary'] = []
					for (const entry of summary) {
						if (entry.accountOpenStatus === 'true') {
							autoSummary.push({
								subscriberName: entry.creditorContact?.subscriber?.name?.unparsed,
								currentBalance: entry.currentBalance,
								estimatedAPR: entry.estimatedAPR,
								late24MonthsReported: entry.late24MonthsReported,
								remainingMonths: entry.remainingMonths,
								scheduledMonthlyPayment: entry.scheduledMonthlyPayment
							})
						}
					}
					if (autoSummary.length) {
						response.autoSummary = autoSummary
					}
				}
			}
		}
	}
	return response
}
