export interface Indicative {
	socialSecurity: {
		number: string
	}
}

export interface IndicativeResponse {
	socialSecurityNumber?: string
}

export function indicativeHandler(indicative: Indicative): IndicativeResponse {
	let ssn = `${indicative?.socialSecurity?.number}`.replace(/\D/g, '')
	return {
		socialSecurityNumber: ssn
	}
}
