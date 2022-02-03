import Axios, { AxiosInstance, AxiosResponse } from 'axios'
import https from 'https'
import { XMLWrapper } from './XMLWrapper'
import { xmlParser } from './lib/xml'
import { createSubjects, Subject } from './Subject'
import { tradeLinesHandler, TradeLinesHandlerResponse } from './TradeLinesHandler'
import { AddonHandlerResponse, addonProductHandler } from './AddonProductHandler'
import { indicativeHandler, IndicativeResponse } from './IndicativeHandler'

export interface SystemCredentials {
	id: string
	password: string
}

export interface Subscriber {
	industryCode: string
	memberCode: string
	prefix: string | number
	password: string
}

export interface TransunionClientOptions {
	system: SystemCredentials
	modelReportSubscriber: Subscriber
	creditReportSubscriber: Subscriber
	certificate: Buffer
	production: boolean
}

export type RequestOptions<T extends Record<string, unknown> = {}> = T & {
	subjects: Subject[]
}

export type RequestResponse = AddonHandlerResponse &
	IndicativeResponse &
	TradeLinesHandlerResponse & {
		rawRequest: string
		rawResponse: string
	}

export interface RequestErrorResponse {
	error: Error
	rawRequest: RequestResponse['rawRequest']
}

export interface CreditLine {}

export class RequestError extends Error {
	public rawRequest: string
	public rawResponse?: string
	public httpError?: Error
	constructor({
		rawRequest,
		rawResponse,
		httpError,
		message
	}: {
		rawRequest: string
		rawResponse?: string
		httpError?: Error
		message: string
	}) {
		super(message)
		this.rawRequest = rawRequest
		this.rawResponse = rawResponse
		this.httpError = httpError
	}
}

export class TransunionClient {
	private readonly axios: AxiosInstance
	public readonly apiUrl: string

	constructor(private readonly options: TransunionClientOptions) {
		this.apiUrl =
			options.production === true ? 'https://netaccess.transunion.com' : 'https://netaccess-test.transunion.com'
		const httpsAgent = new https.Agent({
			pfx: this.options.certificate,
			passphrase: this.options.system.password,
			keepAlive: false,
			timeout: 10000
		})
		this.axios = Axios.create({
			baseURL: this.apiUrl,
			headers: { 'Content-Type': 'text/xml' },
			httpsAgent
		})
	}

	private async request({
		productCode,
		subjects,
		subscriber
	}: {
		productCode: string
		subjects: Subject[]
		subscriber: Subscriber
	}) {
		const xml = XMLWrapper({
			system: this.options.system,
			subscriber,
			product: {
				code: productCode,
				body: createSubjects(subjects)
			},
			production: this.options.production
		})
		try {
			const { data }: AxiosResponse<string> = await this.axios({
				method: 'POST',
				data: xml
			})
			const parsed: Record<string, any> = xmlParser.parse(data)
			const product = parsed?.creditBureau?.product
			if (product) {
				const error: { code: number; description: string } = product.error
				if (error) {
					throw new RequestError({
						rawRequest: xml,
						rawResponse: data,
						message: `${error.description} (CODE: ${error.code})`
					})
				}
				const returnResponse: RequestResponse = {
					rawRequest: xml,
					rawResponse: data
				}
				const record = parsed?.creditBureau?.product?.subject?.subjectRecord
				if (record) {
					const addons = addonProductHandler(record.addOnProduct)
					const indicative = indicativeHandler(record.indicative)
					const tradeLines = tradeLinesHandler(record.custom?.credit?.trade)
					Object.assign(returnResponse, addons, indicative, tradeLines)
				}
				return returnResponse
			} else {
				throw new Error('Product Error')
			}
		} catch (err) {
			if (err instanceof RequestError) {
				throw err
			} else {
				throw new RequestError({
					message: `${err}`,
					httpError: err as Error,
					rawRequest: xml
				})
			}
		}
	}

	public async modelReport({ subjects }: RequestOptions) {
		return this.request({
			productCode: '08000',
			subscriber: this.options.modelReportSubscriber,
			subjects
		})
	}

	public async creditReport({ subjects }: RequestOptions) {
		return this.request({
			productCode: '07000',
			subscriber: this.options.creditReportSubscriber,
			subjects
		})
	}
}
