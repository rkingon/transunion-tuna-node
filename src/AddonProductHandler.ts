export interface AddonProduct {
	[x: string]: any
	code: string
	status: string
}

export interface AddonHandlerResponse {
	vantageScore?: string
	creditVision?: {
		creditCardBalance?: string
		unsecuredBalance?: string
	}
}

export interface CreditVisionCharacteristic {
	algorithmID: string
	id: 'BC33S' | 'US33S'
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
						case 'BC33S': {
							response.creditVision.creditCardBalance = value
							break
						}
						case 'US33S': {
							response.creditVision.unsecuredBalance = value
						}
					}
				}
			}
		}
	}
	return response
}
