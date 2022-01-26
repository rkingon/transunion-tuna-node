export interface Indicative {
	socialSecurity: {
		number: string
	}
}

export interface IndicativeResponse {
	socialSecurityNumber?: string
}

export function indicativeHandler(indicative: Indicative): IndicativeResponse {
	return {
		socialSecurityNumber: indicative?.socialSecurity?.number
	}
}
